import fs from "fs";
import type { RunSummary } from "./types.js";

const START = "<!-- ROUTINE_STATUS_START -->";
const END = "<!-- ROUTINE_STATUS_END -->";
const LAST_RUN_LINE = /\*\*Last run:\*\*\s*`([^`]+)`/;

export interface StatusInput {
  lastRun: string;
  success: boolean;
  durationSec?: number;
  summary?: RunSummary;
  error?: { message: string; stack?: string };
}

function extractStatusBlock(readme: string): string {
  const startIdx = readme.indexOf(START);
  const endIdx = readme.indexOf(END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(
      `README status block missing. Expected ${START} ... ${END} markers.`,
    );
  }
  return readme.slice(startIdx + START.length, endIdx);
}

export function readLastRun(readmePath: string): string {
  const readme = fs.readFileSync(readmePath, "utf8");
  const block = extractStatusBlock(readme);
  const match = block.match(LAST_RUN_LINE);
  if (!match) {
    throw new Error(
      `Could not parse Last run timestamp from README status block.`,
    );
  }
  return match[1]!;
}

export function writeStatus(readmePath: string, input: StatusInput): void {
  const readme = fs.readFileSync(readmePath, "utf8");
  const startIdx = readme.indexOf(START);
  const endIdx = readme.indexOf(END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(
      `README status block missing. Expected ${START} ... ${END} markers.`,
    );
  }

  const rendered = renderStatusBlock(input);
  const updated =
    readme.slice(0, startIdx + START.length) +
    "\n" +
    rendered +
    "\n" +
    readme.slice(endIdx);
  fs.writeFileSync(readmePath, updated, "utf8");
}

function renderStatusBlock(input: StatusInput): string {
  const statusIcon = input.success ? "✅ success" : "❌ failure";
  const duration =
    input.durationSec !== undefined ? `${input.durationSec.toFixed(1)}s` : "—";

  const header = [
    `**Last run:** \`${input.lastRun}\` &nbsp;·&nbsp; **Status:** ${statusIcon} &nbsp;·&nbsp; **Duration:** ${duration}`,
  ].join("\n");

  const summary = input.summary;
  const metrics = summary
    ? [
        ``,
        `| Metric | Value |`,
        `|---|---|`,
        `| Pages crawled | ${summary.pagesCrawled} |`,
        `| Items extracted | ${summary.itemsExtracted} |`,
        `| New tickets suggested | ${summary.newTickets} |`,
        `| Re-raises applied | ${summary.reraises} |`,
        ``,
        summary.triageTableUrl
          ? `**Triage table:** [open in Notion](${summary.triageTableUrl})`
          : `**Triage table:** _(no URL returned)_`,
      ].join("\n")
    : `\n_(no summary — run did not complete)_`;

  const errorBlock = input.error
    ? [
        ``,
        `<details open><summary>Last error</summary>`,
        ``,
        "```",
        input.error.message,
        input.error.stack ? "" : "",
        input.error.stack ?? "",
        "```",
        ``,
        `</details>`,
      ].join("\n")
    : [
        ``,
        `<details><summary>Last error (none)</summary>`,
        ``,
        "```",
        "(no error on most recent run)",
        "```",
        ``,
        `</details>`,
      ].join("\n");

  return [header, metrics, errorBlock].join("\n");
}
