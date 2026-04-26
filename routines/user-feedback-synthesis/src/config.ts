import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROUTINE_ROOT = path.resolve(__dirname, "..");

const NotionConfigSchema = z.object({
  synthesisParentPageId: z.string().min(1),
  backlogDatabaseId: z.string().min(1),
  statusPropertyName: z.string().default("Status"),
  categoryPropertyName: z.string().default("Category"),
  customerAttributionsPropertyName: z
    .string()
    .default("Customer Attributions"),
  sourcesPropertyName: z.string().default("Sources"),
  firstRaisedPropertyName: z.string().default("First Raised"),
  lastRaisedPropertyName: z.string().default("Last Raised"),
  newTicketStatus: z.string().default("Prioritize"),
  doneStatus: z.string().default("Done"),
});

const ConfigSchema = z.object({
  lookbackHours: z.number().positive().default(24),
  model: z.string().default("claude-opus-4-7"),
  notion: NotionConfigSchema,
  enabledAdapters: z.array(z.string()).min(1),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const configPath = path.join(ROUTINE_ROOT, "config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Missing config.json at ${configPath}. Copy config.example.json and fill in IDs.`,
    );
  }
  const raw = JSON.parse(fs.readFileSync(configPath, "utf8")) as unknown;
  return ConfigSchema.parse(raw);
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
