import { google } from "googleapis";
import type { gmail_v1, drive_v3 } from "googleapis";
import type { LoadedAdapter } from "../types.js";
import { requireEnv } from "../config.js";
import { log } from "../log.js";

interface GmailSearchConfig {
  query: string;
  follow_drive_links?: boolean;
}

interface GmailRawItem {
  message_id: string;
  thread_url: string;
  internal_date: string;
  subject: string;
  from: string;
  to: string[];
  snippet: string;
  body_text: string | null;
  transcript_text: string | null;
  drive_url: string | null;
}

export async function fetchGmailSearch(
  adapter: LoadedAdapter,
  windowStart: Date,
): Promise<GmailRawItem[]> {
  const config = adapter.frontmatter.config as unknown as GmailSearchConfig;
  const userEmail = requireEnv("GOOGLE_USER_EMAIL");

  const oauth2Client = new google.auth.OAuth2(
    requireEnv("GOOGLE_CLIENT_ID"),
    requireEnv("GOOGLE_CLIENT_SECRET"),
  );
  oauth2Client.setCredentials({
    refresh_token: requireEnv("GOOGLE_REFRESH_TOKEN"),
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const query = buildQuery(config.query, windowStart);
  log.info(`gmail_search query`, {
    adapter: adapter.frontmatter.name,
    query,
  });

  const list = await gmail.users.messages.list({
    userId: userEmail,
    q: query,
    maxResults: 100,
  });

  const items: GmailRawItem[] = [];
  const messages = list.data.messages ?? [];
  const followDrive = config.follow_drive_links !== false;

  for (const ref of messages) {
    if (!ref.id) continue;
    const message = await gmail.users.messages.get({
      userId: userEmail,
      id: ref.id,
      format: "full",
    });
    const item = await parseMessage(message.data, drive, followDrive);
    if (item) items.push(item);
  }

  log.info(`gmail_search fetched`, {
    adapter: adapter.frontmatter.name,
    count: items.length,
  });
  return items;
}

function buildQuery(baseQuery: string, windowStart: Date): string {
  if (/newer_than:|after:/i.test(baseQuery)) return baseQuery;
  const days = Math.max(
    1,
    Math.ceil((Date.now() - windowStart.getTime()) / (24 * 60 * 60 * 1000)),
  );
  return `${baseQuery} newer_than:${days}d`;
}

async function parseMessage(
  message: gmail_v1.Schema$Message,
  drive: drive_v3.Drive,
  followDrive: boolean,
): Promise<GmailRawItem | null> {
  if (!message.id) return null;

  const headers = message.payload?.headers ?? [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

  const subject = getHeader("Subject");
  const from = getHeader("From");
  const toRaw = getHeader("To");
  const to = toRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const internalDateMs = message.internalDate
    ? Number(message.internalDate)
    : Date.now();
  const internal_date = new Date(internalDateMs).toISOString();

  const body_text = extractPlainText(message.payload);
  const drive_url = body_text ? findDriveLink(body_text) : null;

  let transcript_text: string | null = null;
  if (followDrive && drive_url) {
    transcript_text = await fetchDriveText(drive, drive_url);
  }

  return {
    message_id: message.id,
    thread_url: `https://mail.google.com/mail/u/0/#inbox/${message.threadId ?? message.id}`,
    internal_date,
    subject,
    from,
    to,
    snippet: message.snippet ?? "",
    body_text,
    transcript_text,
    drive_url,
  };
}

function extractPlainText(
  payload: gmail_v1.Schema$MessagePart | undefined,
): string | null {
  if (!payload) return null;
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf8");
  }
  for (const part of payload.parts ?? []) {
    const text = extractPlainText(part);
    if (text) return text;
  }
  if (payload.mimeType === "text/html" && payload.body?.data) {
    const html = Buffer.from(payload.body.data, "base64url").toString("utf8");
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return null;
}

function findDriveLink(text: string): string | null {
  const match = text.match(
    /https:\/\/(?:docs|drive)\.google\.com\/(?:document|file)\/d\/([a-zA-Z0-9_-]+)/,
  );
  return match ? match[0] : null;
}

async function fetchDriveText(
  drive: drive_v3.Drive,
  url: string,
): Promise<string | null> {
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!idMatch) return null;
  const fileId = idMatch[1]!;
  try {
    const meta = await drive.files.get({ fileId, fields: "mimeType,name" });
    const mimeType = meta.data.mimeType ?? "";
    if (mimeType === "application/vnd.google-apps.document") {
      const exported = await drive.files.export({
        fileId,
        mimeType: "text/plain",
      });
      return typeof exported.data === "string"
        ? exported.data
        : String(exported.data);
    }
    if (mimeType.startsWith("text/")) {
      const dl = await drive.files.get({ fileId, alt: "media" });
      return typeof dl.data === "string" ? dl.data : String(dl.data);
    }
    return null;
  } catch (err) {
    log.warn(`drive fetch failed`, {
      url,
      error: (err as Error).message,
    });
    return null;
  }
}
