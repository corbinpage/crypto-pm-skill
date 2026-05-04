# customer-feedback-triage

Daily GitHub Action that crawls a Notion documentation subtree, extracts customer feedback, triages it against the existing backlog, and stages review rows in a Notion **Triage table** for the PM. Re-raises of existing backlog tickets are auto-applied; new-ticket suggestions stay gated behind a `Do?` checkbox.

All Notion fetching and analysis runs through **Claude with the Notion MCP server attached** — no `@notionhq/client` SDK calls in this routine.

## Status

<!-- ROUTINE_STATUS_START -->
**Last run:** `1970-01-01T00:00:00Z` &nbsp;·&nbsp; **Status:** ❌ failure &nbsp;·&nbsp; **Duration:** 0.2s

_(no summary — run did not complete)_

<details open><summary>Last error</summary>

```
400 {"type":"error","error":{"type":"invalid_request_error","message":"MCP server 'notion' is defined but not referenced by any `mcp_toolset` in `tools`."},"request_id":"req_011CafpoxwvRPeXACLRionPD"}

Error: 400 {"type":"error","error":{"type":"invalid_request_error","message":"MCP server 'notion' is defined but not referenced by any `mcp_toolset` in `tools`."},"request_id":"req_011CafpoxwvRPeXACLRionPD"}
    at Function.generate (/home/runner/work/crypto-pm-skill/crypto-pm-skill/routines/customer-feedback-triage/node_modules/@anthropic-ai/sdk/src/core/error.ts:75:14)
    at Anthropic.makeStatusError (/home/runner/work/crypto-pm-skill/crypto-pm-skill/routines/customer-feedback-triage/node_modules/@anthropic-ai/sdk/src/client.ts:516:28)
    at Anthropic.makeRequest (/home/runner/work/crypto-pm-skill/crypto-pm-skill/routines/customer-feedback-triage/node_modules/@anthropic-ai/sdk/src/client.ts:752:24)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
```

</details>
<!-- ROUTINE_STATUS_END -->

> The status block above is rewritten by the workflow on every run, including failures. `Last run` only advances on success — a failed run preserves the previous timestamp so the next run picks up the same window.

## How it works

1. The workflow reads the `Last run` timestamp from this README.
2. Three sequential Claude calls (with the Notion MCP server attached on every call):
   - **Crawl + extract** — recursively walk the subtree under `ROOT_PAGE_ID`, pick up pages edited since `Last run`, extract feedback items with customer attribution.
   - **Triage** — query `BACKLOG_DB_ID`, decide per-item: re-raise of an existing non-Done ticket, or candidate for a new ticket.
   - **Write** — create one row per item in `TRIAGE_TABLE_ID` with `Do? = unchecked`. For re-raises, also append a `## Re-raised: <Customer> via Notion on <date>` block to the matched backlog ticket.
3. The workflow rewrites the status block above (success summary or failure error+stack) and commits the README back to git with `[skip ci]`.

## Required GitHub configuration

### Repository secrets
| Name | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `NOTION_MCP_URL` | Anthropic-hosted Notion MCP connector URL — **verify the exact value in current Anthropic docs** |
| `NOTION_MCP_TOKEN` | Auth token from the Notion connector authorization flow |

### Repository variables (non-secret)
| Name | Purpose |
|---|---|
| `ROOT_PAGE_ID` | Notion page whose subtree gets crawled |
| `TRIAGE_TABLE_ID` | Notion database where review rows are written |
| `BACKLOG_DB_ID` | Existing backlog Kanban database |

## Schedule

Runs daily at 14:00 UTC via `.github/workflows/customer-feedback-triage.yml`. Manual triggers: GitHub → Actions → `customer-feedback-triage` → **Run workflow**.

## Notion setup

See [`NOTION-SCHEMA.md`](./NOTION-SCHEMA.md) for the required Triage table schema. The backlog database from the previous routine is reused unchanged.

## Local development

```bash
cp .env.example .env  # fill in
cp config.example.json config.json  # optional — only if overriding model / beta header
npm install
npm run typecheck
npm start              # runs runOnce() once, updates this README's status block
```

## Out of scope

- Promoting `Do? = checked` rows into real backlog tickets — that's the planned follow-up routine `customer-feedback-execute`.
- Slack/email notifications on new triage rows.
