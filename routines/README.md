# Routines

Background automations that complement the `crypto-pm` skill. Each routine is
self-contained: its own `package.json`, its own entry point, its own cron
schedule. Routines write to and read from Notion (the Paymagic team space) so
that the human PM can review, edit, and promote work between states without
the routine ever reaching into the team's source of truth uninvited.

## Routines in this directory

| Routine | What it does | Schedule |
|---|---|---|
| [`user-feedback-synthesis`](./user-feedback-synthesis/) | Pull customer feedback from configured sources (Notion notes, Gmail/Drive meeting transcripts), publish a daily synthesis page to Notion, and create deduplicated tickets in the Backlog DB. | Daily |

## Architecture

- **Orchestrator** — TypeScript code that handles deterministic IO (fetching
  from sources, writing to Notion).
- **Adapters** — markdown files in each routine's `sources/` directory that
  describe how to fetch and normalize items from a given source. New sources
  drop in as new markdown files.
- **State** — Notion is the system of record. No external DB.
- **LLM** — the Anthropic SDK is used for judgement calls (extraction,
  categorization, synthesis drafting, semantic dedup) with prompt caching on
  the stable system + adapter prompt blocks.

## Running locally

Each routine has its own `run.sh`. From the routine directory:

```bash
npm install
cp .env.example .env  # fill in
cp config.example.json config.json  # fill in IDs
./run.sh
```

## Cron

Each routine ships a `crontab.example`. Install with `crontab -e`.

## Future hosting

The orchestrators are written so they can lift to Vercel cron functions
without code changes — the `runOnce()` export is the entry point both the
local CLI and a future `api/cron/*.ts` handler call.
