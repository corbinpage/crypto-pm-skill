# Routines

Background automations that complement the `crypto-pm` skill. Each routine is self-contained: its own `package.json`, its own entry point, its own scheduler config. State is durable in Notion or in the routine's own `README.md` — never in an external DB.

## Routines in this directory

| Routine | What it does | Schedule | Hosting |
|---|---|---|---|
| [`customer-feedback-triage`](./customer-feedback-triage/) | Crawl a Notion documentation subtree via Claude+MCP, extract customer feedback edited since the last run, triage against the existing backlog (re-raises auto-applied; new tickets staged), write review rows into a Notion Triage table. | Daily | GitHub Actions |

## Architecture

- **Scheduler** — GitHub Actions (`.github/workflows/<routine>.yml`). The workflow checks out the repo, installs deps, runs `npm start`, and commits any state mutations the routine made back to git.
- **Orchestrator** — TypeScript code in `src/`. Reads state from the routine's own `README.md` (durable, in-repo, human-readable). Sequences Claude calls. Validates structured outputs with Zod.
- **Notion + judgement layer** — Claude with the **Notion MCP** server attached. All Notion fetching and all analysis (extraction, triage, writes) happen through Claude tool-loops via the connector. No direct `@notionhq/client` calls in routines that follow this pattern.
- **State** — each routine keeps its last-run timestamp + summary + last error in an HTML-comment block inside its own `README.md`. The workflow commits the README on every run (success or failure) with `[skip ci]`.

## Adding a new routine

1. Create `routines/<name>/` with `package.json`, `tsconfig.json`, `src/`, `prompts/`, `README.md` (including the `<!-- ROUTINE_STATUS_START -->` … `<!-- ROUTINE_STATUS_END -->` block).
2. Add `.github/workflows/<name>.yml` with `permissions: contents: write` and the commit-back step (`if: always()`).
3. Add a row to the table above.
4. Document required GitHub secrets and repository variables in the routine's README.

## Local development

From the routine directory:

```bash
cp .env.example .env  # fill in
npm install
npm start
```

The README's status block updates locally just like in CI.
