import { Client } from "@notionhq/client";
import type { LoadedAdapter } from "../types.js";
import { requireEnv } from "../config.js";
import { log } from "../log.js";

interface NotionDatabaseConfig {
  database_id_env: string;
  customer_property?: string;
  content_property?: string;
  last_edited_property?: string;
}

interface NotionRawItem {
  page_id: string;
  url: string;
  last_edited_time: string;
  properties: Record<string, string | null>;
}

export async function fetchNotionDatabase(
  adapter: LoadedAdapter,
  windowStart: Date,
): Promise<NotionRawItem[]> {
  const config = adapter.frontmatter.config as unknown as NotionDatabaseConfig;
  const databaseId = requireEnv(config.database_id_env);
  const lastEditedProp = config.last_edited_property ?? "Last Edited";

  const notion = new Client({ auth: requireEnv("NOTION_API_KEY") });

  const items: NotionRawItem[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        timestamp: "last_edited_time",
        last_edited_time: { on_or_after: windowStart.toISOString() },
      },
      sorts: [
        { timestamp: "last_edited_time", direction: "descending" },
      ],
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      if (!("properties" in page)) continue;

      const props: Record<string, string | null> = {};
      for (const [key, value] of Object.entries(page.properties)) {
        props[key] = extractPropertyText(value);
      }

      items.push({
        page_id: page.id,
        url: "url" in page ? page.url : "",
        last_edited_time:
          "last_edited_time" in page ? page.last_edited_time : "",
        properties: props,
      });
    }

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  log.info(`notion_database fetched`, {
    adapter: adapter.frontmatter.name,
    count: items.length,
    lastEditedProp,
  });
  return items;
}

function extractPropertyText(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const v = value as { type?: string } & Record<string, unknown>;
  switch (v.type) {
    case "title":
      return ((v.title as Array<{ plain_text: string }> | undefined) ?? [])
        .map((t) => t.plain_text)
        .join("")
        .trim() || null;
    case "rich_text":
      return ((v.rich_text as Array<{ plain_text: string }> | undefined) ?? [])
        .map((t) => t.plain_text)
        .join("")
        .trim() || null;
    case "select":
      return (v.select as { name: string } | null)?.name ?? null;
    case "multi_select":
      return ((v.multi_select as Array<{ name: string }> | undefined) ?? [])
        .map((s) => s.name)
        .join(", ") || null;
    case "people":
      return ((v.people as Array<{ name?: string }> | undefined) ?? [])
        .map((p) => p.name ?? "")
        .filter(Boolean)
        .join(", ") || null;
    case "email":
      return (v.email as string | null) ?? null;
    case "phone_number":
      return (v.phone_number as string | null) ?? null;
    case "url":
      return (v.url as string | null) ?? null;
    case "relation": {
      const rel = (v.relation as Array<{ id: string }> | undefined) ?? [];
      return rel.length > 0 ? rel.map((r) => r.id).join(", ") : null;
    }
    case "date": {
      const d = v.date as { start: string } | null;
      return d?.start ?? null;
    }
    default:
      return null;
  }
}
