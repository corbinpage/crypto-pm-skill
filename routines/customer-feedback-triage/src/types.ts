import { z } from "zod";

export const CategorySchema = z.enum(["feature", "bug", "tech-debt", "other"]);
export type Category = z.infer<typeof CategorySchema>;

export const ExtractedItemSchema = z.object({
  page_id: z.string().min(1),
  page_url: z.string().url(),
  customer: z.string().min(1),
  captured_at: z.string().min(1),
  feedback: z.string().min(1),
  category: CategorySchema,
});
export type ExtractedItem = z.infer<typeof ExtractedItemSchema>;

export const TriageDecisionSchema = z.enum(["new", "reraise"]);
export type TriageDecision = z.infer<typeof TriageDecisionSchema>;

export const TriagedItemSchema = ExtractedItemSchema.extend({
  triage: TriageDecisionSchema,
  matched_ticket_id: z.string().nullable(),
  matched_ticket_title: z.string().nullable(),
  recommended_action: z.string().min(1),
});
export type TriagedItem = z.infer<typeof TriagedItemSchema>;

export const WriteResultSchema = z.object({
  created: z.number().int().nonnegative(),
  reraised: z.number().int().nonnegative(),
  triage_table_url: z.string().url().optional(),
});
export type WriteResult = z.infer<typeof WriteResultSchema>;

export interface RunSummary {
  pagesCrawled: number;
  itemsExtracted: number;
  newTickets: number;
  reraises: number;
  durationSec: number;
  triageTableUrl?: string;
}
