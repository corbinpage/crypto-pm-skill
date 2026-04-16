# Bankr Integration

Bankr enables natural language crypto operations across Base, Ethereum, Polygon, Solana, and Unichain.

## Authentication

API key at bankr.bot/api — select required scopes:
- **Wallet API** — portfolio reads, balances
- **Agent API** — natural language prompts, conversation threads
- **Token Launch** — deploy EVM (Clanker) or Solana (LaunchLab) tokens
- **LLM Gateway** — multi-model AI routing

Store key in environment variable: `BANKR_API_KEY`

## Core Operations

### Portfolio / Read
```bash
bankr wallet portfolio                        # balances + PnL
bankr wallet portfolio --nfts                 # include NFTs
bankr wallet balance --token USDC --chain base
```

### Trading
```bash
# Natural language via Agent API
bankr agent prompt "Buy $50 of ETH on Base"
bankr agent prompt "Swap 100 USDC to SOL"
bankr agent prompt "Bridge 0.1 ETH from Ethereum to Base"
```

### REST API
```
POST /v1/agent/prompt
{ "prompt": "Buy $50 of ETH on Base", "thread_id": "optional-for-context" }
```

### Advanced
- **Leverage trading** — Hyperliquid, Avantis
- **Limit orders** — set price target, execute when hit
- **DCA** — recurring buys on schedule
- **Stop-loss / TWAP** — automation flows
- **Polymarket** — prediction market bets
- **Token deployment** — EVM via Clanker, Solana via LaunchLab
- **x402 paid API discovery** — discover and pay for API access onchain

## Safety Practices
- Use dedicated agent wallets (not personal wallet)
- Default to read-only keys; elevate only when needed
- Configure IP whitelisting in Bankr dashboard
- Test on low-cost chains first (Base, Polygon) before Ethereum mainnet
- Rate limits: 100 calls/day (standard), 1,000/day (Bankr Club)

## Chain IDs
| Chain | ID |
|-------|----|
| Ethereum | 1 |
| Base | 8453 |
| Polygon | 137 |
| Solana | (not EVM) |
| Unichain | 130 |
