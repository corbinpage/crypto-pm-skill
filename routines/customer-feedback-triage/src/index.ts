import fs from "fs";
import path from "path";
import { z } from "zod";
import { loadConfig, loadEnv, PROMPTS_DIR, README_PATH } from "./config.js";
import { readLastRun, writeStatus } from "./state.js";
import { callClaudeMCP, type McpServer } from "./claude.js";
import {
  ExtractedItemSchema,
  TriagedItemSchema,
  WriteResultSchema,
  type ExtractedItem,
  type RunSummary,
  type TriagedItem,
  type WriteResult,
} from "./types.js";
import { log } from "./log.js";

function readPrompt(name: string): string {
  return fs.readFileSync(path.join(PROMPTS_DIR, name), "utf8");
}

export async function runOnce(): Promise<RunSummary> {
  const config = loadConfig();
  const env = loadEnv();
  const lastRun = readLastRun(README_PATH);
  const startedAt = new Date();
  const today = startedAt.toISOString().slice(0, 10);

  log.info("starting run", {
    lastRun,
    rootPageId: env.rootPageId,
    triageTableId: env.triageTableId,
    backlogDbId: env.backlogDbId,
    model: config.model,
  });

  const mcp: McpServer = {
    url: env.notionMcpUrl,
    name: config.mcpServerName,
    token: env.notionMcpToken,
  };

  const sharedCallParams = {
    apiKey: env.anthropicApiKey,
    model: config.model,
    betaHeader: config.mcpBetaHeader,
    mcpServers: [mcp],
  };

  // Step 1: crawl + extract
  const crawlPrompt = readPrompt("CRAWL.md");
  const extracted = await callClaudeMCP<ExtractedItem[]>(
    {
      ...sharedCallParams,
      maxTokens: config.maxTokens.crawl,
      systemPrompt: crawlPrompt,
      userMessage: JSON.stringify({
        root_page_id: env.rootPageId,
        since: lastRun,
      }),
    },
    z.array(ExtractedItemSchema),
  );
  log.info("crawl complete", { extracted: extracted.length });

  if (extracted.length === 0) {
    const durationSec = (Date.now() - startedAt.getTime()) / 1000;
    return {
      pagesCrawled: 0,
      itemsExtracted: 0,
      newTickets: 0,
      reraises: 0,
      durationSec,
    };
  }

  // Step 2: triage against backlog
  const triagePrompt = readPrompt("TRIAGE.md");
  const triaged = await callClaudeMCP<TriagedItem[]>(
    {
      ...sharedCallParams,
      maxTokens: config.maxTokens.triage,
      systemPrompt: triagePrompt,
      userMessage: JSON.stringify({
        items: extracted,
        backlog_db_id: env.backlogDbId,
      }),
    },
    z.array(TriagedItemSchema),
  );
  const newCount = triaged.filter((t) => t.triage === "new").length;
  const reraiseCount = triaged.filter((t) => t.triage === "reraise").length;
  log.info("triage complete", {
    new: newCount,
    reraise: reraiseCount,
  });

  // Step 3: write rows + append re-raises
  const writePrompt = readPrompt("WRITE.md");
  const writeResult = await callClaudeMCP<WriteResult>(
    {
      ...sharedCallParams,
      maxTokens: config.maxTokens.write,
      systemPrompt: writePrompt,
      userMessage: JSON.stringify({
        triage_table_id: env.triageTableId,
        backlog_db_id: env.backlogDbId,
        rows: triaged,
        today,
      }),
    },
    WriteResultSchema,
  );
  log.info("write complete", writeResult as unknown as Record<string, unknown>);

  const durationSec = (Date.now() - startedAt.getTime()) / 1000;
  return {
    pagesCrawled: extracted.length,
    itemsExtracted: extracted.length,
    newTickets: writeResult.created,
    reraises: writeResult.reraised,
    durationSec,
    triageTableUrl: writeResult.triage_table_url,
  };
}

const isDirectRun =
  typeof process !== "undefined" &&
  process.argv[1] &&
  import.meta.url === `file://${process.argv[1]}`;

if (isDirectRun) {
  const startedAt = new Date();
  const startedAtIso = startedAt.toISOString();

  // Snapshot the previous LAST_RUN now so we can preserve it on failure.
  let previousLastRun: string;
  try {
    previousLastRun = readLastRun(README_PATH);
  } catch (err) {
    log.error("could not read README status block", {
      error: (err as Error).message,
    });
    process.exit(1);
  }

  runOnce()
    .then((summary) => {
      console.log("\n=== run summary ===");
      console.log(JSON.stringify(summary, null, 2));
      writeStatus(README_PATH, {
        lastRun: startedAtIso,
        success: true,
        durationSec: summary.durationSec,
        summary,
      });
      log.info("README status updated (success)");
      process.exit(0);
    })
    .catch((err) => {
      const error = err as Error;
      log.error("run failed", { error: error.message });
      writeStatus(README_PATH, {
        lastRun: previousLastRun,
        success: false,
        durationSec: (Date.now() - startedAt.getTime()) / 1000,
        error: { message: error.message, stack: error.stack },
      });
      console.error(error);
      process.exit(1);
    });
}
