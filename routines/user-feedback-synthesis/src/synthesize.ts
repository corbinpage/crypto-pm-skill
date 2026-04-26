import fs from "fs";
import path from "path";
import { z } from "zod";
import { ROUTINE_ROOT } from "./config.js";
import { callClaudeJSON } from "./claude.js";
import {
  NormalizedFeedbackItemSchema,
  SynthesisOutputSchema,
} from "./types.js";
import type {
  LoadedAdapter,
  NormalizedFeedbackItem,
  SynthesisOutput,
} from "./types.js";

const NormalizedArraySchema = z.array(NormalizedFeedbackItemSchema);

let cachedSynthesisPrompt: string | null = null;

function loadSynthesisPrompt(): string {
  if (cachedSynthesisPrompt) return cachedSynthesisPrompt;
  const promptPath = path.join(ROUTINE_ROOT, "SYNTHESIS-PROMPT.md");
  cachedSynthesisPrompt = fs.readFileSync(promptPath, "utf8");
  return cachedSynthesisPrompt;
}

/**
 * Run an adapter's normalization prompt over its raw items, returning
 * NormalizedFeedbackItem[]. Forces source = adapter name and customer to
 * "Unknown" if missing.
 */
export async function normalizeWithAdapter(
  adapter: LoadedAdapter,
  rawItems: unknown[],
  model: string,
): Promise<NormalizedFeedbackItem[]> {
  if (rawItems.length === 0) return [];

  const userMessage = JSON.stringify(
    { raw_items: rawItems },
    null,
    2,
  );

  const items = await callClaudeJSON(
    {
      model,
      systemPrompt: adapter.promptBody,
      userMessage,
      maxTokens: 16000,
      cacheSystemPrompt: true,
    },
    NormalizedArraySchema,
  );

  // Defensive: enforce source name and Unknown fallback
  return items.map((item) => ({
    ...item,
    source: adapter.frontmatter.name,
    customer: item.customer.trim().length > 0 ? item.customer : "Unknown",
  }));
}

/**
 * Categorize + draft the daily synthesis markdown in one Claude call.
 */
export async function synthesizeDay(input: {
  date: string;
  lookbackHours: number;
  items: NormalizedFeedbackItem[];
  model: string;
}): Promise<SynthesisOutput> {
  const userMessage = JSON.stringify(
    {
      date: input.date,
      lookbackHours: input.lookbackHours,
      items: input.items,
    },
    null,
    2,
  );

  return callClaudeJSON(
    {
      model: input.model,
      systemPrompt: loadSynthesisPrompt(),
      userMessage,
      maxTokens: 16000,
      cacheSystemPrompt: true,
    },
    SynthesisOutputSchema,
  );
}
