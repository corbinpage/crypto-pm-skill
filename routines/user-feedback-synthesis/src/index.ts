import { loadConfig } from "./config.js";
import { loadAdapters } from "./adapters.js";
import { fetchNotionDatabase } from "./kinds/notion_database.js";
import { fetchGmailSearch } from "./kinds/gmail_search.js";
import { normalizeWithAdapter, synthesizeDay } from "./synthesize.js";
import { NotionPM } from "./notion.js";
import { processTakeaways } from "./tickets.js";
import { log } from "./log.js";
import type { LoadedAdapter, NormalizedFeedbackItem } from "./types.js";

export interface RunSummary {
  date: string;
  itemsBySource: Record<string, number>;
  totalItems: number;
  takeaways: number;
  newTickets: number;
  reraises: number;
  synthesisPageUrl: string;
}

async function fetchRawForAdapter(
  adapter: LoadedAdapter,
  windowStart: Date,
): Promise<unknown[]> {
  switch (adapter.frontmatter.kind) {
    case "notion_database":
      return fetchNotionDatabase(adapter, windowStart);
    case "gmail_search":
      return fetchGmailSearch(adapter, windowStart);
    default: {
      const exhaustive: never = adapter.frontmatter.kind;
      throw new Error(`Unsupported adapter kind: ${String(exhaustive)}`);
    }
  }
}

export async function runOnce(): Promise<RunSummary> {
  const config = loadConfig();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const windowStart = new Date(now.getTime() - config.lookbackHours * 3600 * 1000);

  log.info("starting run", {
    today,
    lookbackHours: config.lookbackHours,
    adapters: config.enabledAdapters,
    model: config.model,
  });

  const adapters = loadAdapters(config.enabledAdapters);

  const allItems: NormalizedFeedbackItem[] = [];
  const itemsBySource: Record<string, number> = {};

  for (const adapter of adapters) {
    let raw: unknown[] = [];
    try {
      raw = await fetchRawForAdapter(adapter, windowStart);
    } catch (err) {
      log.error("adapter fetch failed", {
        adapter: adapter.frontmatter.name,
        error: (err as Error).message,
      });
      itemsBySource[adapter.frontmatter.name] = 0;
      continue;
    }

    if (raw.length === 0) {
      itemsBySource[adapter.frontmatter.name] = 0;
      continue;
    }

    let normalized: NormalizedFeedbackItem[] = [];
    try {
      normalized = await normalizeWithAdapter(adapter, raw, config.model);
    } catch (err) {
      log.error("adapter normalization failed", {
        adapter: adapter.frontmatter.name,
        error: (err as Error).message,
      });
      itemsBySource[adapter.frontmatter.name] = 0;
      continue;
    }

    itemsBySource[adapter.frontmatter.name] = normalized.length;
    allItems.push(...normalized);
  }

  log.info("normalization complete", {
    itemsBySource,
    total: allItems.length,
  });

  const synthesis = await synthesizeDay({
    date: today,
    lookbackHours: config.lookbackHours,
    items: allItems,
    model: config.model,
  });

  log.info("synthesis drafted", {
    takeaways: synthesis.takeaways.length,
    markdownChars: synthesis.daily_markdown.length,
  });

  const notion = new NotionPM(config.notion);
  const dailyPage = await notion.createDailyPage(today, synthesis.daily_markdown);
  log.info("daily page created", {
    pageId: dailyPage.pageId,
    pageUrl: dailyPage.pageUrl,
  });

  let newTickets = 0;
  let reraises = 0;

  if (synthesis.takeaways.length > 0) {
    const existing = await notion.listBacklogTickets();
    log.info("backlog loaded", { existing: existing.length });

    const result = await processTakeaways({
      takeaways: synthesis.takeaways,
      existingTickets: existing,
      todaySynthesisUrl: dailyPage.pageUrl,
      todaySynthesisPageId: dailyPage.pageId,
      today,
      model: config.model,
      notion,
    });
    newTickets = result.newTickets;
    reraises = result.reraises;
  }

  const summary: RunSummary = {
    date: today,
    itemsBySource,
    totalItems: allItems.length,
    takeaways: synthesis.takeaways.length,
    newTickets,
    reraises,
    synthesisPageUrl: dailyPage.pageUrl,
  };
  log.info("run complete", summary as unknown as Record<string, unknown>);
  return summary;
}

const isDirectRun =
  typeof process !== "undefined" &&
  process.argv[1] &&
  import.meta.url === `file://${process.argv[1]}`;

if (isDirectRun) {
  runOnce()
    .then((summary) => {
      console.log("\n=== run summary ===");
      console.log(JSON.stringify(summary, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      log.error("run failed", { error: (err as Error).message });
      console.error(err);
      process.exit(1);
    });
}
