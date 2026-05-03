# Notion Schema

## 1. Root page (`ROOT_PAGE_ID`)

A regular Notion page whose entire subtree gets crawled. Could be an existing "Customer Notes" hub, a meeting-notes index page, a CS notes page, etc. Sub-pages and sub-databases are walked recursively to any depth.

**Connection:** the Notion MCP integration must be granted access to this page. Notion's MCP connector inherits access from whatever you authorize during the OAuth flow.

## 2. Backlog database (`BACKLOG_DB_ID`)

The existing backlog Kanban. The triage step queries it and may append re-raise notes to its tickets. **No schema changes required.** The expected shape (from the project's prior conventions):

| Property | Type | Notes |
|---|---|---|
| `Title` | Title | — |
| `Status` | Select | `Prioritize`, `Backlog`, `Scoping`, `Development`, `Testing`, `Done` |
| `Category` | Select | `Feature`, `Tech Debt`, `Confusion/Error`, `Other` |

The triage step skips tickets with `Status = Done`.

## 3. Triage table (`TRIAGE_TABLE_ID`) — **must be created**

Create a new full-page Notion database with these properties:

| Property | Type | Options / notes |
|---|---|---|
| `Customer Feedback` | Title | Verbatim excerpt (truncated for the title; full text in the page body) |
| `Customer` | Rich text | Customer name or `"Unknown"` |
| `Source` | URL | Link to the original Notion source page |
| `Captured At` | Date | Source page's `last_edited_time` |
| `Category` | Select | `Feature`, `Bug`, `Tech Debt`, `Other` |
| `Triage` | Select | `New ticket suggested`, `Re-raise (applied)` |
| `Existing Ticket` | Rich text | Title + URL of matched backlog ticket (empty for new) |
| `Recommended Action` | Rich text | Claude's suggested next step |
| `Do?` | Checkbox | Always created unchecked; PM checks to mark reviewed/approved |

### Recommended views
- **Inbox** — filter `Do? = unchecked`, sort by `Captured At` descending. The PM's daily working view.
- **Approved** — filter `Do? = checked`. Feeds the future `customer-feedback-execute` routine.

## 4. Notion MCP integration

The Anthropic-hosted Notion MCP connector handles OAuth on its end. After authorizing it against your Notion workspace, it has access to whichever pages and databases you selected during consent. Make sure the root page, the backlog database, and the triage database are all included.
