---
name: gmail-meetings
kind: gmail_search
required_env:
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - GOOGLE_REFRESH_TOKEN
  - GOOGLE_USER_EMAIL
config:
  query: 'from:(meet-recordings-noreply@google.com OR fireflies.ai OR otter.ai) (transcript OR recording)'
  follow_drive_links: true
---

# Adapter: gmail-meetings

You are normalizing meeting recording / transcript notification emails into
customer feedback items. The dispatcher fetches matching Gmail messages and,
where possible, the linked transcript bodies from Google Drive.

## Input

The user turn contains a JSON object:

```json
{
  "raw_items": [
    {
      "message_id": "...",
      "thread_url": "https://mail.google.com/...",
      "internal_date": "2026-04-26T15:02:00Z",
      "subject": "Meeting recording: Paymagic <> Acme Corp",
      "from": "meet-recordings-noreply@google.com",
      "to": ["pm@paymagic.xyz"],
      "snippet": "Your meeting recording is ready...",
      "body_text": "Optional plain-text email body",
      "transcript_text": "Optional — full transcript text if a Drive link could be followed",
      "drive_url": "Optional — URL to the transcript doc"
    }
  ]
}
```

## Output

Emit a single JSON array of `NormalizedFeedbackItem` — one entry per
distinct **customer concern** raised in the meeting. A single meeting with
three distinct concerns produces three entries.

```json
[
  {
    "content": "Concise but specific paraphrase of the concern, with enough context to be actionable",
    "source": "gmail-meetings",
    "source_url": "<drive_url if available else thread_url>",
    "customer": "<inferred customer name, or 'Unknown'>",
    "captured_at": "<internal_date, ISO 8601>"
  }
]
```

## Rules

- **Customer attribution priority:** infer from (in order)
  1. `subject` line if it contains a clear company / customer name (e.g.
     "Paymagic <> Acme Corp" → Acme Corp).
  2. Speaker labels in `transcript_text` ("Sarah from Acme: ...") if any
     non-Paymagic participant identifies their employer.
  3. The `to:` recipient domain if it's clearly the customer's domain.
  4. Otherwise, `"Unknown"`.
- **Multiple customers in one meeting:** if the meeting has more than one
  customer represented (joint call, panel), set `customer` per-concern
  based on who raised it. Default to `"Unknown"` rather than guessing.
- **Skip non-feedback content:** scheduling chatter, rapport-building,
  Paymagic team-internal discussion. Only normalize moments where the
  customer expressed a need, frustration, request, or confusion.
- If `transcript_text` is missing, work from `body_text` + `snippet`. If
  there's not enough signal to extract any concrete concern, return an
  empty array.
- Always set `source` to the literal string `"gmail-meetings"`.
- Output JSON only. No prose, no markdown fences.
