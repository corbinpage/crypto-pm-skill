# Source adapter interface

Every source adapter is a markdown file in this directory with YAML
frontmatter. The frontmatter declares what kind of source it is and its
config; the body is the LLM prompt used to normalize raw items into
`NormalizedFeedbackItem`.

## Frontmatter

```yaml
---
name: <unique adapter name; matches filename and `enabledAdapters` entry>
kind: notion_database | gmail_search
required_env: [LIST, OF, ENV, VARS]
config:
  # kind-specific keys — see below
---
```

### `kind: notion_database`

Pulls rows from a Notion database whose `Last Edited Time` falls within the
lookback window.

```yaml
config:
  database_id_env: NOTION_NOTES_DB_ID    # name of env var holding the DB ID
  customer_property: Customer            # optional; property holding customer name
  content_property: Notes                # optional; property to use as content
  last_edited_property: Last Edited      # optional; defaults to "Last Edited"
```

The dispatcher fetches all rows whose `last_edited_property` ≥ `now - lookback`.

### `kind: gmail_search`

Runs a Gmail search query and (optionally) follows Drive links in matching
messages to fetch transcript content.

```yaml
config:
  query: 'from:(meet-recordings-noreply@google.com OR fireflies.ai) newer_than:2d'
  follow_drive_links: true              # optional; default true
```

The dispatcher injects a `newer_than:Nd` clause based on `lookbackHours` if
the query doesn't already include one.

## Body (markdown prompt)

The body is the system prompt the orchestrator passes to Claude when
normalizing this adapter's raw items. The orchestrator passes the raw
items as user-turn JSON; the prompt must instruct Claude to emit
`NormalizedFeedbackItem[]` JSON.

The shape Claude must produce:

```json
[
  {
    "content": "verbatim or lightly cleaned excerpt",
    "source": "<adapter name>",
    "source_url": "https://...",
    "customer": "Acme Corp" | "Unknown",
    "captured_at": "ISO 8601 timestamp"
  }
]
```

## Adding a new source

1. **If the data lives behind a kind that already exists** (`notion_database`,
   `gmail_search`): drop in a new markdown file with appropriate frontmatter
   and prompt body. No code change.
2. **If it's a new integration** (Twitter, Intercom, Zoom, etc.): add a new
   `src/kinds/<kind_name>.ts` dispatcher that returns raw items, then write
   the markdown adapter that uses it.
