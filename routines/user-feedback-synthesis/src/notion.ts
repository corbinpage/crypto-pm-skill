import { Client } from "@notionhq/client";
import type {
  CreatePageParameters,
  UpdatePageParameters,
  AppendBlockChildrenParameters,
  PageObjectResponse,
  QueryDatabaseResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints.js";
import type { Config } from "./config.js";
import { requireEnv } from "./config.js";
import type { BacklogTicketSummary, Category } from "./types.js";
import { CATEGORY_DISPLAY } from "./types.js";

const CATEGORY_TO_NOTION: Record<Category, string> = CATEGORY_DISPLAY;

export class NotionPM {
  private readonly client: Client;
  private readonly config: Config["notion"];

  constructor(config: Config["notion"]) {
    this.client = new Client({ auth: requireEnv("NOTION_API_KEY") });
    this.config = config;
  }

  /**
   * Create the daily synthesis page as a child of the parent page.
   * Returns the new page's URL and ID.
   */
  async createDailyPage(
    dateLabel: string,
    markdownBody: string,
  ): Promise<{ pageId: string; pageUrl: string }> {
    const params: CreatePageParameters = {
      parent: { type: "page_id", page_id: this.config.synthesisParentPageId },
      properties: {
        title: {
          title: [{ type: "text", text: { content: dateLabel } }],
        },
      },
      children: markdownToBlocks(markdownBody),
    };
    const response = (await this.client.pages.create(params)) as PageObjectResponse;
    return { pageId: response.id, pageUrl: response.url };
  }

  /**
   * Pull all non-Done backlog tickets, projected to a small dedup-friendly shape.
   */
  async listBacklogTickets(): Promise<BacklogTicketSummary[]> {
    const tickets: BacklogTicketSummary[] = [];
    let cursor: string | undefined = undefined;
    do {
      const response: QueryDatabaseResponse = await this.client.databases.query({
        database_id: this.config.backlogDatabaseId,
        filter: {
          property: this.config.statusPropertyName,
          select: { does_not_equal: this.config.doneStatus },
        },
        page_size: 100,
        start_cursor: cursor,
      });

      for (const result of response.results) {
        if (!isFullPage(result)) continue;
        const summary = this.summarizeTicket(result);
        if (summary) tickets.push(summary);
      }

      cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
    } while (cursor);
    return tickets;
  }

  /**
   * Create a new ticket in the Backlog DB with status = newTicketStatus.
   */
  async createTicket(input: {
    title: string;
    category: Category;
    customer: string;
    sourcesUrl: string;
    today: string; // YYYY-MM-DD
    rationale: string;
    contributors: Array<{
      customer: string;
      source: string;
      source_url: string;
      quote: string;
    }>;
  }): Promise<{ pageId: string; pageUrl: string }> {
    const params: CreatePageParameters = {
      parent: { database_id: this.config.backlogDatabaseId },
      properties: {
        Title: {
          title: [{ type: "text", text: { content: input.title } }],
        },
        [this.config.statusPropertyName]: {
          select: { name: this.config.newTicketStatus },
        },
        [this.config.categoryPropertyName]: {
          select: { name: CATEGORY_TO_NOTION[input.category] },
        },
        [this.config.customerAttributionsPropertyName]: {
          rich_text: [{ type: "text", text: { content: input.customer } }],
        },
        [this.config.sourcesPropertyName]: {
          rich_text: [
            {
              type: "text",
              text: { content: input.sourcesUrl, link: { url: input.sourcesUrl } },
            },
          ],
        },
        [this.config.firstRaisedPropertyName]: {
          date: { start: input.today },
        },
        [this.config.lastRaisedPropertyName]: {
          date: { start: input.today },
        },
      },
      children: ticketBodyBlocks(input),
    };
    const response = (await this.client.pages.create(params)) as PageObjectResponse;
    return { pageId: response.id, pageUrl: response.url };
  }

  /**
   * Append a re-raise section to an existing ticket and update the
   * Customer Attributions / Sources / Last Raised properties.
   */
  async appendReraise(
    pageId: string,
    input: {
      customer: string;
      source: string;
      sourceUrl: string;
      quote: string;
      todaySynthesisUrl: string;
      today: string;
    },
  ): Promise<void> {
    const existing = (await this.client.pages.retrieve({
      page_id: pageId,
    })) as PageObjectResponse;

    const existingAttributions = readRichText(
      existing.properties[this.config.customerAttributionsPropertyName],
    );
    const newAttributions = mergeAttribution(existingAttributions, input.customer);

    const existingSources = readRichText(
      existing.properties[this.config.sourcesPropertyName],
    );
    const newSources = existingSources
      ? `${existingSources}\n${input.todaySynthesisUrl}`
      : input.todaySynthesisUrl;

    const updateParams: UpdatePageParameters = {
      page_id: pageId,
      properties: {
        [this.config.customerAttributionsPropertyName]: {
          rich_text: [{ type: "text", text: { content: newAttributions } }],
        },
        [this.config.sourcesPropertyName]: {
          rich_text: [{ type: "text", text: { content: newSources } }],
        },
        [this.config.lastRaisedPropertyName]: {
          date: { start: input.today },
        },
      },
    };
    await this.client.pages.update(updateParams);

    const appendParams: AppendBlockChildrenParameters = {
      block_id: pageId,
      children: reraiseBlocks(input),
    };
    await this.client.blocks.children.append(appendParams);
  }

  private summarizeTicket(page: PageObjectResponse): BacklogTicketSummary | null {
    const titleProp = Object.values(page.properties).find(
      (p) => p.type === "title",
    );
    const title =
      titleProp && titleProp.type === "title"
        ? titleProp.title.map((t) => t.plain_text).join("").trim()
        : "";
    if (!title) return null;

    const status = readSelect(page.properties[this.config.statusPropertyName]);
    const category = readSelect(page.properties[this.config.categoryPropertyName]);

    return {
      pageId: page.id,
      title,
      category,
      status,
      bodyExcerpt: "",
    };
  }
}

function readRichText(prop: PageObjectResponse["properties"][string] | undefined): string {
  if (!prop) return "";
  if (prop.type === "rich_text") {
    return prop.rich_text.map((t) => t.plain_text).join("");
  }
  if (prop.type === "title") {
    return prop.title.map((t) => t.plain_text).join("");
  }
  return "";
}

function readSelect(prop: PageObjectResponse["properties"][string] | undefined): string | null {
  if (!prop) return null;
  if (prop.type === "select") return prop.select?.name ?? null;
  return null;
}

function mergeAttribution(existing: string, newCustomer: string): string {
  const trimmedNew = newCustomer.trim();
  if (!trimmedNew) return existing;
  const parts = existing
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.some((p) => p.toLowerCase() === trimmedNew.toLowerCase())) {
    return existing;
  }
  parts.push(trimmedNew);
  return parts.join(", ");
}

function isFullPage(
  result: PageObjectResponse | PartialPageObjectResponse | { object: string },
): result is PageObjectResponse {
  return (
    "properties" in result &&
    typeof (result as PageObjectResponse).properties === "object"
  );
}

function ticketBodyBlocks(input: {
  rationale: string;
  contributors: Array<{
    customer: string;
    source: string;
    source_url: string;
    quote: string;
  }>;
}): CreatePageParameters["children"] {
  const blocks: NonNullable<CreatePageParameters["children"]> = [
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: input.rationale } }],
      },
    },
    {
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: "Contributors" } }],
      },
    },
  ];

  for (const c of input.contributors) {
    blocks.push({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: `${c.customer} via ${c.source}: ` } },
          { type: "text", text: { content: `"${c.quote}"` } },
          { type: "text", text: { content: " — " } },
          {
            type: "text",
            text: { content: c.source_url, link: { url: c.source_url } },
          },
        ],
      },
    });
  }

  return blocks;
}

function reraiseBlocks(input: {
  customer: string;
  source: string;
  sourceUrl: string;
  quote: string;
  todaySynthesisUrl: string;
  today: string;
}): AppendBlockChildrenParameters["children"] {
  return [
    {
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            type: "text",
            text: {
              content: `Re-raised: ${input.customer} via ${input.source} on ${input.today}`,
            },
          },
        ],
      },
    },
    {
      object: "block",
      type: "quote",
      quote: {
        rich_text: [{ type: "text", text: { content: input.quote } }],
      },
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Source: " } },
          {
            type: "text",
            text: { content: input.sourceUrl, link: { url: input.sourceUrl } },
          },
          { type: "text", text: { content: " — Synthesis: " } },
          {
            type: "text",
            text: {
              content: input.todaySynthesisUrl,
              link: { url: input.todaySynthesisUrl },
            },
          },
        ],
      },
    },
  ];
}

/**
 * Convert a markdown string to Notion block children. Conservative: handles
 * headings (#, ##, ###), bullets (-, *), numbered lists (1.), blockquotes (>),
 * and paragraphs. Anything more complex falls back to a plain paragraph.
 */
function markdownToBlocks(md: string): NonNullable<CreatePageParameters["children"]> {
  const blocks: NonNullable<CreatePageParameters["children"]> = [];
  const lines = md.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.length === 0) continue;

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1]!.length;
      const text = headingMatch[2]!;
      if (level === 1) {
        blocks.push({
          object: "block",
          type: "heading_1",
          heading_1: { rich_text: [{ type: "text", text: { content: text } }] },
        });
      } else if (level === 2) {
        blocks.push({
          object: "block",
          type: "heading_2",
          heading_2: { rich_text: [{ type: "text", text: { content: text } }] },
        });
      } else {
        blocks.push({
          object: "block",
          type: "heading_3",
          heading_3: { rich_text: [{ type: "text", text: { content: text } }] },
        });
      }
      continue;
    }

    const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (bulletMatch) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: bulletMatch[1]! } }],
        },
      });
      continue;
    }

    const numberedMatch = line.match(/^\s*\d+\.\s+(.*)$/);
    if (numberedMatch) {
      blocks.push({
        object: "block",
        type: "numbered_list_item",
        numbered_list_item: {
          rich_text: [{ type: "text", text: { content: numberedMatch[1]! } }],
        },
      });
      continue;
    }

    const quoteMatch = line.match(/^>\s+(.*)$/);
    if (quoteMatch) {
      blocks.push({
        object: "block",
        type: "quote",
        quote: {
          rich_text: [{ type: "text", text: { content: quoteMatch[1]! } }],
        },
      });
      continue;
    }

    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: line.trim() } }],
      },
    });
  }

  return blocks;
}
