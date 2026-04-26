# User Feedback Synthesis

Daily routine that:

1. Pulls customer feedback from every enabled adapter in `sources/` over the
   configured lookback window (default: last 24 hours).
2. Normalizes each item into a common shape with mandatory customer
   attribution (`Unknown` if not derivable).
3. Categorizes each item as `Feature`, `Tech Debt`, `Confusion/Error`, or
   `Other`, and ranks the day's biggest takeaways.
4. Publishes a daily synthesis page under the **User Feedback Synthesis**
   parent in the Paymagic Notion team space (titled `YYYY-MM-DD`), with
   "Biggest Takeaways" at the top and per-source items below.
5. For each takeaway, searches the **Backlog** database for a semantically
   similar existing ticket. If one exists, appends a `## Re-raised:` block
   to that ticket with the new customer + source + date. Otherwise creates
   a new ticket with status `Prioritize`.

## PoC adapters

- `notion-notes` — pulls rows from a Notion "Customer Notes" database that
  were edited within the lookback window.
- `gmail-meetings` — searches Gmail for meeting recording / transcript
  emails in the lookback window and follows Drive links to fetch the
  transcript bodies.

Architecture supports adding Twitter, Intercom, Zoom, etc. by dropping in a
new markdown adapter (and, if needed, a new `kinds/` dispatcher).

## Setup

1. **Create the Notion structures** in the Paymagic team space — see
   [`NOTION-SCHEMA.md`](./NOTION-SCHEMA.md). Add your Notion integration to
   both the parent page and the Backlog database (Notion → Connections).
2. **Install:**
   ```bash
   cd routines/user-feedback-synthesis
   npm install
   ```
3. **Configure environment:**
   ```bash
   cp .env.example .env
   # fill in ANTHROPIC_API_KEY, NOTION_API_KEY, NOTION_NOTES_DB_ID, Google OAuth
   ```
4. **Configure routine:**
   ```bash
   cp config.example.json config.json
   # fill in synthesisParentPageId and backlogDatabaseId
   ```
5. **Run once manually to verify:**
   ```bash
   ./run.sh
   ```

## Cron

```
0 7 * * * cd /path/to/crypto-pm-skill/routines/user-feedback-synthesis && ./run.sh >> /var/log/user-feedback-synthesis.log 2>&1
```

See [`crontab.example`](./crontab.example).

## Adding a new source

1. Create `sources/<name>.md` following [`sources/_ADAPTER-INTERFACE.md`](./sources/_ADAPTER-INTERFACE.md).
2. Add `<name>` to `enabledAdapters` in `config.json`.
3. If the adapter's `kind` doesn't match an existing dispatcher in
   `src/kinds/`, add a new one.

## Future: Vercel hosting

`src/index.ts` exports a `runOnce()` function. To lift to Vercel, add an
`api/cron/synthesize.ts` that imports and calls it; no other code changes
needed. State stays in Notion.
