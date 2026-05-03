import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROUTINE_ROOT = path.resolve(__dirname, "..");
export const README_PATH = path.join(ROUTINE_ROOT, "README.md");
export const PROMPTS_DIR = path.join(ROUTINE_ROOT, "prompts");

const ConfigSchema = z.object({
  model: z.string().default("claude-opus-4-7"),
  mcpBetaHeader: z.string().default("mcp-client-2025-04-04"),
  mcpServerName: z.string().default("notion"),
  maxTokens: z
    .object({
      crawl: z.number().int().positive().default(32000),
      triage: z.number().int().positive().default(16000),
      write: z.number().int().positive().default(16000),
    })
    .default({ crawl: 32000, triage: 16000, write: 16000 }),
});
export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const configPath = path.join(ROUTINE_ROOT, "config.json");
  const raw = fs.existsSync(configPath)
    ? (JSON.parse(fs.readFileSync(configPath, "utf8")) as unknown)
    : {};
  return ConfigSchema.parse(raw);
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export interface RuntimeEnv {
  anthropicApiKey: string;
  notionMcpUrl: string;
  notionMcpToken: string;
  rootPageId: string;
  triageTableId: string;
  backlogDbId: string;
}

export function loadEnv(): RuntimeEnv {
  return {
    anthropicApiKey: requireEnv("ANTHROPIC_API_KEY"),
    notionMcpUrl: requireEnv("NOTION_MCP_URL"),
    notionMcpToken: requireEnv("NOTION_MCP_TOKEN"),
    rootPageId: requireEnv("ROOT_PAGE_ID"),
    triageTableId: requireEnv("TRIAGE_TABLE_ID"),
    backlogDbId: requireEnv("BACKLOG_DB_ID"),
  };
}
