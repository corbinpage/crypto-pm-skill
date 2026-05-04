import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export interface McpServer {
  url: string;
  name: string;
  token: string;
}

interface CallParams {
  apiKey: string;
  model: string;
  betaHeader: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
  mcpServers: McpServer[];
}

/**
 * Send a single Messages API request with the Notion MCP server attached and
 * parse the final text block as JSON. Uses streaming + finalMessage to avoid
 * SDK HTTP timeouts at high max_tokens; uses prompt caching on the system
 * prompt; uses adaptive thinking since these calls involve judgement.
 *
 * MCP support lives under `client.beta.messages.*`. The exact shape of the
 * beta request body has changed across SDK versions — we cast the params to
 * pass `mcp_servers` and `betas` even when the stable SDK types lag.
 */
export async function callClaudeMCP<T>(
  params: CallParams,
  schema: z.ZodType<T>,
): Promise<T> {
  const { apiKey, model, betaHeader, systemPrompt, userMessage, maxTokens, mcpServers } =
    params;

  const client = new Anthropic({ apiKey });

  const requestBody = {
    model,
    max_tokens: maxTokens,
    system: [
      {
        type: "text" as const,
        text: systemPrompt,
        cache_control: { type: "ephemeral" as const },
      },
    ],
    messages: [{ role: "user" as const, content: userMessage }],
    thinking: { type: "adaptive" as const },
    mcp_servers: mcpServers.map((s) => ({
      type: "url",
      url: s.url,
      name: s.name,
      authorization_token: s.token,
    })),
    // Beta `mcp-client-2025-11-20` requires explicit opt-in: each declared
    // MCP server must be referenced by an `mcp_toolset` entry in `tools` to
    // expose its tools to the model.
    tools: mcpServers.map((s) => ({
      type: "mcp_toolset",
      server_name: s.name,
    })),
    betas: [betaHeader],
  };

  // SDK type definitions may lag behind the beta API surface — cast on the
  // way in. The response is fully typed.
  const beta = client.beta as unknown as {
    messages: {
      stream: (
        body: unknown,
      ) => { finalMessage: () => Promise<Anthropic.Message> };
    };
  };
  const stream = beta.messages.stream(requestBody);
  const response = await stream.finalMessage();

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (!textBlock) {
    throw new Error(
      "Claude returned no text block (only tool uses?) — cannot parse JSON output.",
    );
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
