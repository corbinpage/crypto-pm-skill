# Notion Schema

All objects live in the **Paymagic** team space. Create them once, then put
the IDs in `config.json` and grant your Notion integration access to each.

## 1. Parent page: "User Feedback Synthesis"

A regular page in the Paymagic team space. The routine creates one child
page per run, titled `YYYY-MM-DD`.

- **Where:** Paymagic team space → root.
- **Name:** `User Feedback Synthesis`
- **Connections:** add your integration via the page's `•••` → `Connections`.
- **Config field:** `notion.synthesisParentPageId`.

## 2. Database: "Backlog"

Create a full-page database in the Paymagic team space.

- **Where:** Paymagic team space.
- **Name:** `Backlog`
- **Connections:** add your integration to the database.
- **Config field:** `notion.backlogDatabaseId`.

### Properties

| Name | Type | Options / Notes |
|---|---|---|
| `Title` | Title | Default — Notion creates this automatically. |
| `Status` | Select | Options: `Prioritize`, `Backlog`, `Scoping`, `Development`, `Testing`, `Done`. New tickets land in `Prioritize`. |
| `Category` | Select | Options: `Feature`, `Tech Debt`, `Confusion/Error`, `Other`. |
| `Customer Attributions` | Rich text | Free text, appended to over time. |
| `Sources` | URL **or** Rich text | Links to the daily synthesis pages where this ticket was raised. |
| `First Raised` | Date | Set when the ticket is first created. |
| `Last Raised` | Date | Updated every time a re-raise is appended. |

The property names above are the defaults the routine expects. If you rename
a property, update the matching `*PropertyName` field in `config.json`.

### Status workflow

```
Prioritize  →  Backlog  →  Scoping  →  Development  →  Testing  →  Done
```

The synthesis routine only creates tickets in `Prioritize` and updates
existing tickets' `Customer Attributions` / `Sources` / `Last Raised`. It
never moves a ticket to a different status.

## Finding the IDs

- **Page ID:** open the page in a browser. The URL ends in
  `...-<32 hex chars>`. That trailing hex string is the page ID.
- **Database ID:** open the database as a full page. The URL contains
  `<32 hex chars>?v=<view id>`. The first hex string is the database ID.

Both can be copied as-is into `config.json` (with or without dashes — the
Notion SDK accepts either).
