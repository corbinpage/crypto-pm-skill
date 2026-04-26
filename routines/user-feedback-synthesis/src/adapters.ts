import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";
import { ROUTINE_ROOT } from "./config.js";
import type { LoadedAdapter } from "./types.js";

const FrontmatterSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(["notion_database", "gmail_search"]),
  required_env: z.array(z.string()).optional(),
  config: z.record(z.unknown()),
});

export function loadAdapters(enabled: string[]): LoadedAdapter[] {
  const sourcesDir = path.join(ROUTINE_ROOT, "sources");
  const adapters: LoadedAdapter[] = [];

  for (const name of enabled) {
    const filePath = path.join(sourcesDir, `${name}.md`);
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Adapter "${name}" not found at ${filePath}. Either remove it from config.enabledAdapters or create the markdown file.`,
      );
    }
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const frontmatter = FrontmatterSchema.parse(parsed.data);

    if (frontmatter.name !== name) {
      throw new Error(
        `Adapter file ${filePath} has frontmatter name "${frontmatter.name}" but is configured as "${name}". They must match.`,
      );
    }

    for (const envVar of frontmatter.required_env ?? []) {
      if (!process.env[envVar]) {
        throw new Error(
          `Adapter "${name}" requires env var ${envVar} but it is not set.`,
        );
      }
    }

    adapters.push({
      frontmatter,
      promptBody: parsed.content.trim(),
      filePath,
    });
  }

  return adapters;
}
