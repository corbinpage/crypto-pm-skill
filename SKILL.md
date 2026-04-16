---
name: crypto-pm
description: Product management workflows for crypto/Web3 projects — PRDs, issue triage, interface design, QA, brainstorming, GitHub triage, and Bankr trading integration. Understands DeFi, L1/L2 chains, stablecoins, bridges, NFTs, DAOs, and all major crypto tickers. Use when working on a crypto product, writing a PRD for a Web3 feature, triaging blockchain-related issues, designing DeFi interfaces, or executing onchain operations via Bankr.
---

# crypto-pm

Crypto-native product management skill. Combines full PM workflows with deep Web3 domain knowledge and live onchain execution via Bankr.

See [WORKFLOWS.md](WORKFLOWS.md) for step-by-step processes.
See [CRYPTO-REFERENCE.md](CRYPTO-REFERENCE.md) for tickers, terms, and protocol details.
See [BANKR.md](BANKR.md) for onchain execution via natural language.

## Quick Reference — Workflows

| Task | Process |
|------|---------|
| PRD → phased plan | Vertical slices, durable arch first → [WORKFLOWS.md#prd-to-plan](WORKFLOWS.md#prd-to-plan) |
| PRD → GitHub issues | Thin end-to-end slices, dependency order → [WORKFLOWS.md#prd-to-issues](WORKFLOWS.md#prd-to-issues) |
| Bug report → issue | TDD plan, root cause, acceptance criteria → [WORKFLOWS.md#triage-issue](WORKFLOWS.md#triage-issue) |
| QA feedback → issue | 2-3 clarifying Qs, scope assessment → [WORKFLOWS.md#qa](WORKFLOWS.md#qa) |
| New feature design | Design-it-twice, 3+ parallel approaches → [WORKFLOWS.md#design-interface](WORKFLOWS.md#design-interface) |
| GitHub inbox triage | Label-based state machine → [WORKFLOWS.md#github-triage](WORKFLOWS.md#github-triage) |
| Brainstorm a feature | Context-first, visual companion, YAGNI → [WORKFLOWS.md#brainstorming](WORKFLOWS.md#brainstorming) |
| Execute onchain op | Natural language → Bankr API → [BANKR.md](BANKR.md) |

## Crypto Language Defaults

When discussing crypto products, default to correct terminology:
- Use **TVL** not "total deposits"; **DAU** not "daily users"; **fee revenue** not "earnings"
- Use correct tickers: ETH, BTC, SOL, USDC, ARB, OP, UNI, AAVE, etc.
- Distinguish **protocol revenue** (kept by DAO) from **fee revenue** (total fees generated)
- Use **L1/L2**, **mainnet/testnet**, **EOA/contract**, **on-chain/off-chain** consistently
- Prefer **EIP/ERC numbers** when referencing standards (ERC-20, ERC-4626, EIP-1559)
- Full crypto term glossary: [CRYPTO-REFERENCE.md](CRYPTO-REFERENCE.md)
