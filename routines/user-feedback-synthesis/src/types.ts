import { z } from "zod";

export const CategorySchema = z.enum([
  "feature",
  "tech-debt",
  "confusion-error",
  "other",
]);
export type Category = z.infer<typeof CategorySchema>;

export const CATEGORY_DISPLAY: Record<Category, string> = {
  feature: "Feature",
  "tech-debt": "Tech Debt",
  "confusion-error": "Confusion/Error",
  other: "Other",
};

export const NormalizedFeedbackItemSchema = z.object({
  content: z.string().min(1),
  source: z.string().min(1),
  source_url: z.string().url(),
  customer: z.string().min(1),
  captured_at: z.string().min(1),
});
export type NormalizedFeedbackItem = z.infer<
  typeof NormalizedFeedbackItemSchema
>;

export const TakeawayContributorSchema = z.object({
  customer: z.string().min(1),
  source: z.string().min(1),
  source_url: z.string().url(),
  quote: z.string().min(1),
});
export type TakeawayContributor = z.infer<typeof TakeawayContributorSchema>;

export const TakeawaySchema = z.object({
  title: z.string().min(1).max(200),
  category: CategorySchema,
  rationale: z.string().min(1),
  contributors: z.array(TakeawayContributorSchema).min(1),
});
export type Takeaway = z.infer<typeof TakeawaySchema>;

export const SynthesisOutputSchema = z.object({
  takeaways: z.array(TakeawaySchema),
  daily_markdown: z.string().min(1),
});
export type SynthesisOutput = z.infer<typeof SynthesisOutputSchema>;

export interface AdapterFrontmatter {
  name: string;
  kind: "notion_database" | "gmail_search";
  required_env?: string[];
  config: Record<string, unknown>;
}

export interface LoadedAdapter {
  frontmatter: AdapterFrontmatter;
  promptBody: string;
  filePath: string;
}

export interface RawItemBatch {
  adapter: string;
  raw: unknown;
}

export interface BacklogTicketSummary {
  pageId: string;
  title: string;
  category: string | null;
  status: string | null;
  bodyExcerpt: string;
}

export interface DedupMatch {
  matched_ticket_id: string | null;
  reasoning: string;
}
