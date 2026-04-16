# crypto-pm-skill

A [Claude Code](https://claude.ai/code) skill for crypto and Web3 product management. Combines full PM workflows with deep blockchain domain knowledge and live onchain execution via Bankr.

## Install

Add to your Claude Code project by pointing your skill config at this repo, or copy the files into your `.claude/skills/crypto-pm/` directory.

## Features

### PM Workflows

Seven production-grade PM workflows, each with crypto-specific additions:

| Workflow | What it does |
|----------|-------------|
| **PRD → Plan** | Transforms a PRD into a phased implementation plan using tracer-bullet vertical slices. Flags contract-change phases, audit requirements, and testnet/mainnet milestones. |
| **PRD → GitHub Issues** | Breaks a PRD into independently-deliverable issues in dependency order. Each issue includes chain, contract, oracle, and bridge context. |
| **Triage Issue** | Investigates bugs with deep codebase + on-chain exploration, generates a TDD fix plan, and files a GitHub issue instantly. Checks block explorers, contract state, and indexer lag. |
| **QA → Issue** | Conversational QA triage — 2-3 clarifying questions, scope assessment, files issues in domain language without file paths or line numbers. |
| **Design an Interface** | "Design It Twice" — generates 3+ radically different interface designs (minimalist, flexible, optimized) and compares them before any code is written. Covers wallet state, approval flows, tx confirmation UX. |
| **GitHub Triage** | Label-based state machine for processing GitHub issues. Manages `needs-triage → needs-info → ready-for-agent → ready-for-human → wontfix` transitions. Maintains `.out-of-scope/` for rejected features. |
| **Brainstorm** | Design-first feature exploration. No code until design is approved. Applies YAGNI ruthlessly to crypto (don't add governance before PMF, don't build multi-chain before single-chain works). |

### Crypto Domain Knowledge

The skill understands the language of crypto natively — no need to explain what TVL, MEV, or ERC-4626 mean.

**~80 tickers covered** across:
- Layer 1s: BTC, ETH, SOL, AVAX, SUI, APT, NEAR, DOT, ATOM, and more
- Layer 2s: ARB, OP, Base, Polygon, zkSync, Starknet, Blast, and more
- DeFi: UNI, AAVE, COMP, CRV, LDO, PENDLE, HYPE, GMX, JUP, and more
- Stablecoins: USDC, USDT, DAI/USDS, USDe, PYUSD, FRAX, crvUSD, GHO
- Infrastructure: GRT, FIL, AR, TIA, LINK, PYTH

**Full glossary** of:
- Blockchain fundamentals (gas, gwei, EIP-1559, MEV, PoH, epochs, finality)
- DeFi primitives (AMM, TVL, IL, flash loans, liquidations, veTokens, Curve Wars)
- Perps and derivatives (funding rate, OI, mark price, leverage)
- Bridges and interop (lock-and-mint, intent-based, OFT, VAA, DVN, GMP)
- NFTs, DAOs, wallets, account abstraction

**Chain-specific concepts** for Ethereum, Solana, Cosmos, Avalanche, and Polkadot.

**PM metrics** — TVL, DAU/MAU, fee revenue vs. protocol revenue, FDV vs. market cap, staking ratio, OI, bad debt, Nakamoto coefficient, bribe efficiency.

### Bankr Integration

Execute onchain operations in natural language via the [Bankr](https://bankr.bot) API.

- Token swaps and cross-chain bridges
- Portfolio reads with PnL and NFT tracking
- Leverage trading (Hyperliquid, Avantis)
- Limit orders, DCA, stop-loss, TWAP automation
- Polymarket prediction market bets
- Token deployment (EVM via Clanker, Solana via LaunchLab)
- Supported chains: Base, Ethereum, Polygon, Solana, Unichain

```bash
bankr agent prompt "Buy $50 of ETH on Base"
bankr agent prompt "Bridge 0.1 ETH from Ethereum to Base"
bankr wallet portfolio
```

## File Structure

```
crypto-pm/
├── SKILL.md              # Entry point — triggers and workflow index
├── WORKFLOWS.md          # All 7 PM workflows with crypto-specific guidance
├── CRYPTO-REFERENCE.md   # Tickers, glossary, PM metrics, chain concepts
└── BANKR.md              # Bankr API auth, CLI, REST, and safety practices
```

## Sources

Workflows synthesized from:
- [mattpocock/skills](https://github.com/mattpocock/skills) — prd-to-plan, prd-to-issues, triage-issue, qa, design-an-interface, github-triage
- [obra/superpowers](https://github.com/obra/superpowers) — brainstorming
- [muratcankoylan/agent-skills-for-context-engineering](https://github.com/muratcankoylan/agent-skills-for-context-engineering) — context engineering patterns
- [BankrBot/skills](https://github.com/BankrBot/skills) — Bankr integration
- Protocol docs from ~40 sources across the top 100 crypto projects
