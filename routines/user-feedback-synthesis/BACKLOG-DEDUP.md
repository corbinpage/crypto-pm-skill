# Backlog Dedup Rules

Goal: avoid duplicate tickets in the Backlog database. When today's run
surfaces a takeaway that matches an existing ticket, append a re-raise
section to that ticket instead of creating a new one.

## Match scope

- Search **all tickets** in the Backlog DB whose `Status` is **not** `Done`.
- Match is **semantic, not string-based**. The LLM compares titles +
  category + a body excerpt, not exact text.

## Match criteria (LLM judgement)

A ticket matches a takeaway when:

- They describe the same underlying problem, feature request, or area —
  even if phrased differently or coming from a different customer.
- The categories are compatible (e.g. a "Feature" takeaway can re-raise a
  "Feature" ticket; not a "Tech Debt" ticket).

If multiple existing tickets could match, pick the one whose title is
closest in meaning. If the takeaway is a meaningful superset of the
existing ticket (e.g. broader scope), still re-raise — the PM can split it
during prioritization.

When in doubt, **create a new ticket**. Better a duplicate the PM merges
than a re-raise hidden inside an unrelated ticket.

## Re-raise format

Appended to the matched ticket's body as a new block:

```markdown
## Re-raised: <Customer> via <Source> on <YYYY-MM-DD>

> <Verbatim quote or close paraphrase from the source item.>

Source: <URL to today's synthesis page or original source>
```

In addition:

- Append the customer name to `Customer Attributions` (comma-separated;
  dedupe if already present).
- Append today's synthesis page URL to `Sources` (no dedupe — this is the
  audit trail of when the ticket was re-raised).
- Set `Last Raised` to today.
- **Do not** change `Status`, `Title`, or `Category`.

## New ticket format

When no match is found:

- `Title`: short, action-oriented summary of the takeaway.
- `Status`: `Prioritize`.
- `Category`: one of `Feature`, `Tech Debt`, `Confusion/Error`, `Other`.
- `Customer Attributions`: the customer name(s) for this takeaway.
- `Sources`: URL to today's synthesis page.
- `First Raised` / `Last Raised`: today.
- Body: a one-paragraph rationale + bullet list of contributing source
  items (each with customer + source link).
