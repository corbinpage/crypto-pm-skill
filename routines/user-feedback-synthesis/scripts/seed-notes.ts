import { Client, isFullDatabase, isFullPage } from "@notionhq/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTINE_ROOT = path.resolve(__dirname, "..");

interface NotionConfig {
  synthesisParentPageId: string;
  backlogDatabaseId: string;
}

const config = JSON.parse(
  fs.readFileSync(path.join(ROUTINE_ROOT, "config.json"), "utf8"),
) as { notion: NotionConfig };

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_NOTES_DB_ID = process.env.NOTION_NOTES_DB_ID;

if (!NOTION_API_KEY) throw new Error("NOTION_API_KEY missing in env");
if (!NOTION_NOTES_DB_ID) throw new Error("NOTION_NOTES_DB_ID missing in env");

const notion = new Client({ auth: NOTION_API_KEY });

const SAMPLES = [
  {
    customer: "Acme Corp",
    notes:
      "Spent 30 min onboarding the team — they kept asking why approvals show twice for stablecoin swaps. Want a single confirm step. Also asked for USDC<>USDT direct on Base without going through ETH.",
  },
  {
    customer: "Northwind",
    notes:
      "Loved the limit order UX but the bridge confirmation page is confusing — they thought the tx had failed because the destination chain balance didn't update for ~2 min. Need clearer 'pending on destination' state.",
  },
  {
    customer: "Initech",
    notes:
      "Asked about portfolio PnL accuracy. Their NFT floor prices looked stale (~6h old). Otherwise happy with portfolio reads.",
  },
];

async function probe(id: string, label: string) {
  console.log(`\n--- ${label} (${id}) ---`);
  try {
    const db = await notion.databases.retrieve({ database_id: id });
    const title = isFullDatabase(db)
      ? db.title.map((t) => t.plain_text).join("") || "(untitled)"
      : "(partial)";
    console.log(`  ✓ database: "${title}"`);
    if (isFullDatabase(db)) {
      console.log(`  properties: ${Object.keys(db.properties).join(", ")}`);
    }
    return { kind: "database" as const, db };
  } catch (e) {
    if ((e as { code?: string }).code !== "object_not_found") {
      // try page next
    }
  }
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    let title = "(untitled)";
    if (isFullPage(page)) {
      for (const v of Object.values(page.properties)) {
        if ((v as { type: string }).type === "title") {
          title =
            ((v as unknown as { title: Array<{ plain_text: string }> }).title || [])
              .map((t) => t.plain_text)
              .join("") || "(untitled)";
          break;
        }
      }
    }
    console.log(`  ✓ page: "${title}"`);
    return { kind: "page" as const, page };
  } catch (e) {
    console.log(`  ✗ ${(e as Error).message}`);
    return { kind: "none" as const };
  }
}

async function ensureNotesDatabase(id: string): Promise<string> {
  const result = await probe(id, "Notes resource");
  if (result.kind === "database") {
    const db = result.db;
    if (!isFullDatabase(db)) return id;
    const props = db.properties;
    const hasCustomer = "Customer" in props;
    const hasNotes = "Notes" in props;
    if (hasCustomer && hasNotes) {
      console.log(`  → using existing database (has Customer + Notes)`);
      return id;
    }
    throw new Error(
      `Notes database is missing required properties. Has: [${Object.keys(props).join(", ")}]. Needs: Customer (rich_text), Notes (rich_text).`,
    );
  }
  if (result.kind === "page") {
    console.log(`  → creating "Customer Notes" database inside this page...`);
    const created = await notion.databases.create({
      parent: { type: "page_id", page_id: id },
      title: [{ type: "text", text: { content: "Customer Notes" } }],
      properties: {
        Title: { title: {} },
        Customer: { rich_text: {} },
        Notes: { rich_text: {} },
      },
    });
    console.log(`  ✓ created database ${created.id}`);
    console.log(
      `  ⚠ UPDATE .env: NOTION_NOTES_DB_ID=${created.id.replace(/-/g, "")}`,
    );
    return created.id;
  }
  throw new Error(
    `Could not access Notes resource ${id}. Add the integration to the page/DB via Connections.`,
  );
}

async function seed(databaseId: string) {
  console.log(`\n--- seeding ${SAMPLES.length} sample rows ---`);
  for (const s of SAMPLES) {
    const created = await notion.pages.create({
      parent: { type: "database_id", database_id: databaseId },
      properties: {
        Title: {
          title: [
            {
              type: "text",
              text: { content: `${s.customer} — ${s.notes.slice(0, 40)}…` },
            },
          ],
        },
        Customer: {
          rich_text: [{ type: "text", text: { content: s.customer } }],
        },
        Notes: {
          rich_text: [{ type: "text", text: { content: s.notes } }],
        },
      },
    });
    console.log(`  ✓ ${s.customer}: ${created.id}`);
  }
}

async function main() {
  console.log("=== Notion connectivity + seed ===");

  const me = await notion.users.me({});
  console.log(`integration: ${me.name ?? "(unnamed)"} (${me.id})`);

  const synth = await probe(
    config.notion.synthesisParentPageId,
    "Synthesis parent",
  );
  if (synth.kind !== "page") {
    throw new Error(
      "Synthesis parent must be a page. Add the integration via Connections.",
    );
  }

  const backlog = await probe(config.notion.backlogDatabaseId, "Backlog DB");
  if (backlog.kind !== "database") {
    throw new Error(
      "Backlog must be a database. Add the integration via Connections.",
    );
  }

  const notesDbId = await ensureNotesDatabase(NOTION_NOTES_DB_ID!);
  await seed(notesDbId);

  console.log("\n=== done ===");
}

main().catch((e) => {
  console.error("\nFAILED:", e.message);
  process.exit(1);
});
