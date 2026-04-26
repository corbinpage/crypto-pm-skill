import { z } from "zod";
import { callClaudeJSON } from "./claude.js";
import { CATEGORY_DISPLAY } from "./types.js";
import type {
  BacklogTicketSummary,
  Takeaway,
  Category,
} from "./types.js";
import type { NotionPM } from "./notion.js";
import { log } from "./log.js";

const DEDUP_PROMPT = `You are the dedup classifier for a Backlog database.

Given:
- A "takeaway" (proposed new ticket): a title + category + rationale.
- A list of existing non-Done backlog tickets, each with id, title, and category.

Decide whether the takeaway re-raises an existing ticket. Two items match when
they describe the same underlying problem, feature request, or area — even if
phrased differently or coming from a different customer — and have compatible
categories.

If multiple existing tickets could match, pick the one closest in meaning. If
the takeaway is broader in scope but covers the existing one, still match.
When genuinely uncertain, return null — better a duplicate the PM merges than
a re-raise hidden inside an unrelated ticket.

Output a single JSON object, no prose, no markdown fences:

{
  "matched_ticket_id": "<page id from candidates>" | null,
  "reasoning": "<one sentence>"
}
`;

const DedupResponseSchema = z.object({
  matched_ticket_id: z.string().nullable(),
  reasoning: z.string(),
});

interface ProcessTicketsInput {
  takeaways: Takeaway[];
  existingTickets: BacklogTicketSummary[];
  todaySynthesisUrl: string;
  todaySynthesisPageId: string;
  today: string; // YYYY-MM-DD
  model: string;
  notion: NotionPM;
}

interface ProcessTicketsResult {
  newTickets: number;
  reraises: number;
}

export async function processTakeaways(
  input: ProcessTicketsInput,
): Promise<ProcessTicketsResult> {
  let newTickets = 0;
  let reraises = 0;

  // Pre-build the candidate list once. Cache it via prompt caching by keeping
  // it in the SYSTEM prompt; per-takeaway, only the user message changes.
  const candidatePayload =
    input.existingTickets.length === 0
      ? "(no existing tickets)"
      : JSON.stringify(
          input.existingTickets.map((t) => ({
            id: t.pageId,
            title: t.title,
            category: t.category,
            status: t.status,
          })),
          null,
          2,
        );

  const systemPrompt = `${DEDUP_PROMPT}\n\nExisting backlog tickets (non-Done):\n${candidatePayload}`;

  for (const takeaway of input.takeaways) {
    const userMessage = JSON.stringify(
      {
        takeaway: {
          title: takeaway.title,
          category: takeaway.category,
          rationale: takeaway.rationale,
        },
      },
      null,
      2,
    );

    const dedup =
      input.existingTickets.length === 0
        ? { matched_ticket_id: null, reasoning: "no candidates" }
        : await callClaudeJSON(
            {
              model: input.model,
              systemPrompt,
              userMessage,
              maxTokens: 1024,
              cacheSystemPrompt: true,
            },
            DedupResponseSchema,
          );

    if (dedup.matched_ticket_id) {
      // Re-raise: append a section per contributor.
      for (const contributor of takeaway.contributors) {
        await input.notion.appendReraise(dedup.matched_ticket_id, {
          customer: contributor.customer,
          source: contributor.source,
          sourceUrl: contributor.source_url,
          quote: contributor.quote,
          todaySynthesisUrl: input.todaySynthesisUrl,
          today: input.today,
        });
      }
      reraises += 1;
      log.info(`re-raised ticket`, {
        title: takeaway.title,
        matched_ticket_id: dedup.matched_ticket_id,
        contributors: takeaway.contributors.length,
        reasoning: dedup.reasoning,
      });
    } else {
      const customers = uniquePreserveOrder(
        takeaway.contributors.map((c) => c.customer),
      ).join(", ");
      const created = await input.notion.createTicket({
        title: takeaway.title,
        category: takeaway.category satisfies Category,
        customer: customers,
        sourcesUrl: input.todaySynthesisUrl,
        today: input.today,
        rationale: `${takeaway.rationale} (Category: ${CATEGORY_DISPLAY[takeaway.category]})`,
        contributors: takeaway.contributors,
      });
      newTickets += 1;
      log.info(`new ticket created`, {
        title: takeaway.title,
        page_id: created.pageId,
        category: takeaway.category,
        customers,
      });
    }
  }

  return { newTickets, reraises };
}

function uniquePreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const k = v.trim().toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(v.trim());
    }
  }
  return out;
}
