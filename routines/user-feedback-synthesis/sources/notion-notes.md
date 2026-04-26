---
name: notion-notes
kind: notion_database
required_env:
  - NOTION_API_KEY
  - NOTION_NOTES_DB_ID
config:
  database_id_env: NOTION_NOTES_DB_ID
  customer_property: Customer
  content_property: Notes
  last_edited_property: Last Edited
---

# Adapter: notion-notes

You are normalizing rows from a Notion "Customer Notes" database — manually
captured PM/CS observations about specific customers.

## Input

The user turn contains a JSON object:

```json
{
  "raw_items": [
    {
      "page_id": "...",
      "url": "https://www.notion.so/...",
      "last_edited_time": "2026-04-26T10:14:00Z",
      "properties": {
        "Customer": "Acme Corp" | null,
        "Notes": "Long verbatim text from the Notes property...",
        "Title": "Optional title string"
      }
    }
  ]
}
```

## Output

Emit a single JSON array of `NormalizedFeedbackItem`:

```json
[
  {
    "content": "verbatim or lightly cleaned text from `Notes`; if empty, fall back to Title",
    "source": "notion-notes",
    "source_url": "<page url>",
    "customer": "<Customer property value, or 'Unknown' if null/empty>",
    "captured_at": "<last_edited_time, ISO 8601>"
  }
]
```

## Rules

- Drop rows where `Notes` is empty AND `Title` is empty.
- Always set `source` to the literal string `"notion-notes"`.
- Always set `customer` to the literal string `"Unknown"` if the property
  is null, empty, or missing — never omit the field.
- Preserve the original wording of `Notes`; only clean up obvious garbage
  (HTML entities, repeated whitespace).
- Do not summarize. Verbatim is preferred — the synthesis step will
  summarize across items.
- Output JSON only. No prose, no markdown fences.
