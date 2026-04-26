import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const client = new Anthropic();

interface CallParams {
  model: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  cacheSystemPrompt?: boolean;
  /** Use adaptive thinking. Default true — most calls in this routine involve judgement. */
  adaptiveThinking?: boolean;
}

/**
 * Send a single Messages API request and parse the response as JSON.
 *
 * Defaults follow the claude-api skill: adaptive thinking on, prompt caching
 * on the system prompt, streaming so we don't hit SDK HTTP timeouts at high
 * max_tokens. The model is configurable per call (set in config.json).
 */
export async function callClaudeJSON<T>(
  params: CallParams,
  schema: z.ZodType<T>,
): Promise<T> {
  const {
    model,
    systemPrompt,
    userMessage,
    maxTokens = 16000,
    cacheSystemPrompt = true,
    adaptiveThinking = true,
  } = params;

  const system: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: systemPrompt,
      ...(cacheSystemPrompt
        ? { cache_control: { type: "ephemeral" as const } }
        : {}),
    },
  ];

  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMessage }],
    ...(adaptiveThinking
      ? { thinking: { type: "adaptive" as const } }
      : {}),
  });

  const response = await stream.finalMessage();

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (!textBlock) {
    throw new Error("Claude returned no text block");
  }

  const json = extractJSON(textBlock.text);
  return schema.parse(json);
}

function extractJSON(text: string): unknown {
  const trimmed = text.trim();
  // Strip ```json fences if present (some prompts elicit them despite our instructions)
  const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/);
  const candidate = fenceMatch ? fenceMatch[1]! : trimmed;
  try {
    return JSON.parse(candidate);
  } catch (err) {
    throw new Error(
      `Claude response was not valid JSON: ${(err as Error).message}\n--- response ---\n${trimmed.slice(0, 500)}`,
    );
  }
}
