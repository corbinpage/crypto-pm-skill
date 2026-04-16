# Crypto PM Workflows

---

## PRD to Plan {#prd-to-plan}

Transforms a PRD into a phased implementation plan using **tracer-bullet vertical slices** — thin end-to-end paths through all layers, not horizontal layer-by-layer builds.

### Process
1. **Identify durable architecture decisions** — routes, schemas, data models, auth, chain/contract interfaces, wallet connection strategy
2. **Map vertical slices** — each phase is a narrow but complete workflow: e.g. "user connects wallet → deposits USDC → sees balance" not "implement all contract reads"
3. **Ask about phase granularity** — present 2-3 options (3 big phases vs 7 small ones) and let user choose
4. **Generate Markdown plan** with per-phase acceptance criteria, dependencies, and crypto-specific notes (gas estimation, testnet vs mainnet, contract audit status)

### Crypto PM additions
- Note which phases require smart contract changes (higher risk, longer lead time)
- Flag any phases requiring an audit before mainnet
- Separate "works on testnet" from "production-ready" milestones
- Note bridge/oracle/indexer dependencies (The Graph subgraph, Chainlink feed, LayerZero channel)

---

## PRD to GitHub Issues {#prd-to-issues}

Breaks a PRD into independently-deliverable GitHub issues.

### Process
1. Locate PRD — GitHub issue URL or number, fetch with `gh issue view`
2. Explore codebase for existing patterns (contract ABIs, existing hooks, wagmi config)
3. Draft vertical slices — each issue is one thin end-to-end feature
4. **Quiz user** on proposed breakdown: titles, type (HITL / AFK), dependencies, user stories
5. Create issues in dependency order using template below

### Issue Template
```
## Summary
[One line from user perspective]

## User Story
As a [wallet holder / LP / governance voter], I want to [action] so that [outcome].

## Current Behavior
[What happens now]

## Desired Behavior
[What should happen]

## Acceptance Criteria
- [ ] [Testable, behavior-focused criterion]
- [ ] [Another criterion]

## Blockchain Context
- Chain: [Base / Ethereum / Solana / etc.]
- Contract(s): [address or TBD]
- Dependencies: [oracle, bridge, indexer, other issue #]

## Out of Scope
[Explicitly excluded work]

Parent: #[PRD issue number]
```

### Principle: Many thin slices over few thick ones
Each completed slice is independently demoable. "User sees their USDC balance" is a slice. "Entire portfolio page" is not.

---

## Triage Issue (Bug → GitHub Issue) {#triage-issue}

Systematic investigation of bugs with TDD fix plan.

### Five Phases
1. **Problem Capture** — brief description from user, minimal questions, start investigating immediately
2. **Deep Exploration** — codebase, contract ABIs, on-chain state, recent deploys, error logs, transaction hashes
3. **Fix Approach** — minimal necessary change, affected modules, required test coverage
4. **TDD Plan** — ordered RED-GREEN cycles, tests via public interfaces not implementation details
5. **Issue Creation** — create immediately, no user review needed

### Crypto-specific investigation additions
- Check transaction hash on block explorer (Etherscan, Basescan, Solscan)
- Check contract state on-chain vs. what frontend expects
- Note if bug is reproducible on testnet only / mainnet only
- Identify if it's a frontend display bug vs. contract state bug vs. indexer lag
- Check if related to a recent contract upgrade or chain upgrade (EIP, hardfork)

### Issue quality rule
"A good bug report reads like a spec; a bad one reads like a diff." Focus on observable behavior, not line numbers.

---

## QA Feedback → Issue {#qa}

Conversational workflow for QA-reported problems.

### Process
- **Listen lightly** — 2-3 clarifying questions max, then investigate
- **Explore codebase context** via background agents
- **Assess scope** — single issue or multiple? (Split when fixes span independent areas)
- **File issues** without asking user to review first

### Issue writing rules
- Write from user perspective using domain language (swap, bridge, stake, claim, vote)
- No file paths or line numbers in issues
- Mandatory reproduction steps
- Behavior-focused, not code-focused
- For crypto: include wallet type, chain, token, transaction hash if available

---

## Design an Interface {#design-interface}

"Design It Twice" methodology — generate and compare radically different interface designs before implementing.

### Workflow
1. **Requirements** — problem solved, intended users (traders, LPs, DAO voters, NFT collectors), core operations, constraints, abstraction boundaries
2. **Generate 3+ designs** — each from a different design principle:
   - Minimalism (fewest possible methods)
   - Flexibility (maximum composability)
   - Optimization (best performance/gas characteristics)
   - Paradigm inspiration (React hooks style, Unix pipes, event-driven, etc.)
3. **Present each design** — interface signatures, usage examples, internal complexity
4. **Compare** — simplicity, generality, implementation efficiency, depth (hidden complexity behind minimal interface)
5. **Synthesize** — best design for primary use case, explore cross-design combinations

### Crypto interface considerations
- Consider wallet state (connected / disconnected / wrong network)
- Gas estimation and approval flows are part of the interface
- Optimistic UI updates vs. waiting for transaction confirmation
- Error states: rejected tx, reverted tx, network congestion, RPC failure
- Multi-step flows: approve → deposit, sign → broadcast → confirm

---

## GitHub Triage {#github-triage}

Label-based state machine for processing GitHub issues systematically.

### State Labels (exactly one per issue)
| Label | Meaning |
|-------|---------|
| `needs-triage` | Awaiting maintainer evaluation |
| `needs-info` | Waiting on reporter |
| `ready-for-agent` | Spec complete, AFK agent can tackle |
| `ready-for-human` | Needs human judgment |
| `wontfix` | Rejected — document in `.out-of-scope/` |

### Category Labels
- `bug` — something broken
- `enhancement` — new capability

### Overview Mode (process in this order)
1. Unlabeled issues (never triaged) — oldest first
2. `needs-triage` issues — oldest first
3. `needs-info` issues with new reporter activity (surfaced back to `needs-triage`)

### Single Issue Triage
1. Full context: issue + prior notes + relevant codebase
2. Recommend category + state with reasoning
3. For bugs: attempt reproduction first
4. If under-specified: "grilling session" to flesh out spec
5. Preview comments + label changes before applying

### Out-of-Scope Management
When closing as `wontfix`, write `.out-of-scope/<concept>.md` with:
- Concept statement
- Reasoning referencing project scope/philosophy or technical constraints
- Prior requests list

### Crypto triage additions
- Tag chain-specific issues: `chain:base`, `chain:ethereum`, `chain:solana`, etc.
- Tag component: `contract`, `frontend`, `indexer`, `api`
- Note if issue requires on-chain state verification before triaging

---

## Brainstorming {#brainstorming}

Design-first methodology. **Do NOT write any code or scaffold until design is approved.**

### Nine Sequential Tasks
1. Explore context (codebase, existing contracts, user flows)
2. Offer visual companion (UI mockups, architecture diagrams) when helpful
3. Ask clarifying questions — **one question per message**
4. Propose 2-3 approaches with tradeoffs
5. Present design sections
6. Write design document
7. Self-review (completeness, consistency, YAGNI)
8. Request user review
9. Transition to implementation skill

### YAGNI for crypto
- Don't design multi-chain before proving single-chain
- Don't build governance before proving product-market fit
- Don't add token incentives before the core loop works
- Don't over-engineer bridge flows — use a proven aggregator (Li.Fi, Across) first

### Visual companion
Use browser-based visual tooling for: UI mockups, architecture diagrams, token flow diagrams, smart contract interaction diagrams. Never reuse filenames; use semantic naming.
