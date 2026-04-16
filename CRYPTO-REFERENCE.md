# Crypto Reference — Tickers, Terms, Protocols

---

## Master Ticker Index

### Layer 1s
| Ticker | Protocol | Notes |
|--------|----------|-------|
| BTC | Bitcoin | PoW, UTXO model, 21M supply cap, ~10min blocks |
| ETH | Ethereum | PoS (post-Merge), EVM, account model, gas in gwei |
| SOL | Solana | PoH+PoS, ~400ms slots, compute units (CU), Sealevel parallel EVM |
| BNB | BNB Chain | EVM-compatible, Binance ecosystem, BSC |
| AVAX | Avalanche | Snow consensus, 3-chain architecture (X/C/P), subnets |
| ADA | Cardano | Ouroboros PoS, UTXO-extended, Haskell |
| SUI | Sui | Move language, object-centric model, parallel execution |
| APT | Aptos | Move language, BFT consensus, parallel execution |
| TRX | Tron | EVM-compatible, high USDT volume |
| NEAR | Near Protocol | Sharding (Nightshade), human-readable addresses |
| DOT | Polkadot | NPoS, relay chain + parachains, XCM interop |
| ATOM | Cosmos | Tendermint BFT, IBC protocol, app-chains |
| ALGO | Algorand | Pure PoS, instant finality |
| HBAR | Hedera | Hashgraph DAG, council governance |
| TON | TON | Telegram-native, sharded, actor model |

### Layer 2s / Scaling
| Ticker | Protocol | Type |
|--------|----------|------|
| ARB | Arbitrum | Optimistic rollup, largest L2 by TVL |
| OP | Optimism | Optimistic rollup, OP Stack (Base uses this) |
| — | Base | Optimistic rollup (Coinbase), OP Stack, no native token |
| POL/MATIC | Polygon | PoS sidechain + zkEVM rollup |
| ZK | zkSync Era | ZK rollup, EVM-compatible |
| STRK | Starknet | ZK rollup, Cairo language, account abstraction native |
| — | Linea | ZK rollup, Consensys |
| — | Scroll | ZK rollup, EVM-equivalent |
| BLAST | Blast | Optimistic rollup, native ETH/USDB yield |

### DeFi — DEXs & Aggregators
| Ticker | Protocol | Chain(s) |
|--------|----------|---------|
| UNI | Uniswap | Ethereum + all major chains |
| CRV | Curve | Ethereum + multichain, stablecoin AMM |
| BAL | Balancer | Ethereum + multichain, weighted pools |
| JUP | Jupiter | Solana, swap aggregator |
| RAY | Raydium | Solana, AMM + CLMM |
| ORCA | Orca | Solana, Whirlpools (CLMM) |
| — | 1inch | Aggregator, multichain |
| — | Li.Fi | Bridge + swap aggregator |
| — | Across | Intent-based bridge |

### DeFi — Lending
| Ticker | Protocol | Notes |
|--------|----------|-------|
| AAVE | Aave | v2/v3, overcollateralized, flash loans, Health Factor |
| COMP | Compound | v2/v3 (Comet), supply/borrow markets |
| MKR/SKY | MakerDAO/Sky | DAI/USDS stablecoin, PSM, DSR, CDPs |
| MORPHO | Morpho | Optimized lending, peer-to-peer matching |
| EULER | Euler | Modular lending |

### DeFi — Liquid Staking & Restaking
| Ticker | Protocol | Notes |
|--------|----------|-------|
| LDO | Lido | stETH, largest liquid staking, ~33% ETH stake |
| RPL | Rocket Pool | rETH, decentralized, node operators |
| — | EigenLayer | Restaking, AVS (Actively Validated Services) |
| PENDLE | Pendle | Yield tokenization, PT (principal) + YT (yield) |
| EIGEN | EigenLayer | Restaking token |
| ETHFI | ether.fi | eETH, liquid restaking |

### DeFi — Derivatives & Perps
| Ticker | Protocol | Notes |
|--------|----------|-------|
| HYPE | Hyperliquid | Perps DEX, HLP vault, on-chain order book |
| GMX | GMX | Perps, GLP pool, Arbitrum/Avalanche |
| SNX | Synthetix | Synthetic assets, Perps v3 |
| DYDX | dYdX | Perps, own app-chain (Cosmos) |
| PERP | Perpetual Protocol | vAMM perps |

### Stablecoins
| Ticker | Issuer | Type |
|--------|--------|------|
| USDC | Circle | Fiat-backed, CCTP bridge, regulated |
| USDT | Tether | Fiat-backed, highest volume |
| DAI/USDS | Sky (MakerDAO) | Crypto-collateralized / RWA-backed |
| USDe | Ethena | Delta-neutral synthetic, sUSDe earns yield |
| PYUSD | PayPal | Fiat-backed |
| FRAX | Frax Finance | Algorithmic + collateralized |
| crvUSD | Curve | LLAMMA soft-liquidation mechanism |
| GHO | Aave | Overcollateralized, minted against Aave collateral |

### Bridges & Interop
| — | LayerZero | OFT standard, DVN security model, omnichain |
| — | Wormhole | Guardian network, VAAs, W token |
| — | Axelar | GMP (General Message Passing), AXL token |
| — | Chainlink CCIP | Cross-Chain Interoperability Protocol |
| — | Stargate | STG token, unified liquidity pools |

### Oracles
| LINK | Chainlink | Price feeds, VRF, Automation, CCIP, Data Streams |
| PYTH | Pyth | Pull oracle, high-frequency, confidence intervals |
| — | UMA | Optimistic oracle, dispute resolution |
| — | API3 | First-party oracles, dAPIs |

### Infrastructure
| Ticker | Protocol | Function |
|--------|----------|---------|
| GRT | The Graph | Subgraph indexing, query layer for on-chain data |
| FIL | Filecoin | Decentralized storage, PoRep/PoSt |
| AR | Arweave | Permanent storage, blockweave, endowment model |
| TIA | Celestia | Modular DA layer, DAS (data availability sampling) |
| HNT | Helium | DePIN, wireless network |
| RNDR | Render | DePIN, GPU rendering |

### Governance / DAO Tokens
| Ticker | Protocol |
|--------|----------|
| ENS | Ethereum Name Service |
| SAFE | Safe (multisig) |
| OSMO | Osmosis (Cosmos DEX) |
| INJ | Injective |

### CeFi / Exchange Tokens
| Ticker | Exchange |
|--------|---------|
| BNB | Binance |
| OKB | OKX |
| CRO | Crypto.com |
| KCS | KuCoin |

### Memecoins (high volume, know the tickers)
| Ticker | Name |
|--------|------|
| DOGE | Dogecoin |
| SHIB | Shiba Inu |
| PEPE | Pepe |
| WIF | dogwifhat (Solana) |
| BONK | Bonk (Solana) |
| FARTCOIN | Fartcoin (Solana) |
| POPCAT | Popcat (Solana) |

---

## Core Technical Glossary

### Blockchain Fundamentals
- **Block** — batch of transactions; each chain has target block time (ETH ~12s, SOL ~400ms, BTC ~10min)
- **Finality** — when a block can't be reverted. Probabilistic (PoW) vs. deterministic (PoS BFT)
- **Gas** — unit of computation on EVM; fee = gas_used × (base_fee + priority_fee); denominated in gwei (1e-9 ETH)
- **Gwei** — 1 billionth of ETH; gas prices quoted in gwei
- **EIP-1559** — ETH fee mechanism: base_fee (burned) + priority_fee (to validator). Introduced ETH deflation.
- **EOA** — Externally Owned Account; wallet controlled by private key
- **Smart contract** — code deployed on-chain; address like an EOA but no private key
- **ABI** — Application Binary Interface; spec for calling contract functions
- **UTXO** — Unspent Transaction Output (Bitcoin model) vs. account model (Ethereum)
- **PoW** — Proof of Work (Bitcoin); miners compete on hash
- **PoS** — Proof of Stake; validators stake to propose/attest blocks
- **PoH** — Proof of History (Solana); cryptographic clock, not consensus mechanism
- **Epoch** — period of time in PoS chains; ETH epoch = 32 slots = ~6.4 min
- **Slot** — single block proposal opportunity; ETH slot = 12s, SOL slot = ~400ms

### EVM / Ethereum Specific
- **ERC-20** — fungible token standard
- **ERC-721** — NFT standard (unique tokens)
- **ERC-1155** — multi-token standard (fungible + NFT in one contract)
- **ERC-4626** — tokenized vault standard (yield-bearing tokens, share/asset math)
- **ERC-4337** — account abstraction via UserOperations and Bundlers; enables smart wallets
- **EIP-4844 (Proto-Danksharding)** — blob transactions for L2 data; reduced L2 fees 10-100x
- **MEV** — Maximal Extractable Value; value extracted by reordering/inserting txns
  - **Sandwich attack** — front-run + back-run a victim's swap
  - **Frontrunning** — copy a pending tx with higher gas
  - **Backrunning** — profit after a known state change (e.g., arbitrage)
  - **Flashbots / PBS** — MEV infrastructure; Proposer-Builder Separation
- **Reorg** — blockchain reorganization; older blocks replaced by a competing chain
- **Calldata** — input data to a tx; expensive on L1, replaced by blobs post-4844 for L2s

### DeFi Primitives
- **TVL** — Total Value Locked; assets deposited in a protocol
- **AMM** — Automated Market Maker; algorithmic pricing
  - **Constant product** — x×y=k (Uniswap v2); full range liquidity
  - **Concentrated liquidity** — LP sets price range (Uniswap v3/CLMM); higher capital efficiency
  - **StableSwap** — Curve's AMM; lower slippage for pegged assets
- **Liquidity pool** — smart contract holding token pairs; LPs deposit both sides
- **LP** — Liquidity Provider; earns fees, exposed to impermanent loss
- **Impermanent loss (IL)** — loss vs. holding when pool price diverges; worse at higher volatility
- **Slippage** — difference between expected and executed price; higher for larger trades / thinner liquidity
- **Price impact** — how much your trade moves the price; function of trade size / pool depth
- **Flash loan** — uncollateralized loan within one transaction; must repay same tx
- **Overcollateralized lending** — borrow less than collateral value; Health Factor = collateral_value / debt
- **Liquidation** — when Health Factor < 1; collateral sold to repay debt; liquidator earns bonus
- **Collateral ratio** — collateral value / borrowed value; e.g., 150% means $150 collateral per $100 borrowed
- **Supply APY / Borrow APR** — annualized rates; supply earns, borrow pays
- **APY vs APR** — APY compounds, APR does not; APY > APR for same rate
- **Yield farming** — providing liquidity / staking to earn token rewards
- **Staking** — locking tokens to earn rewards (network staking) or protocol emissions
- **Liquid staking** — receive liquid token (stETH, rETH) representing staked position
- **Restaking** — use staked ETH (or LSTs) as security for other services (EigenLayer AVS)
- **veTokens** — vote-escrowed tokens; lock CRV → veCRV for governance + boosted rewards
- **Gauge** — Curve mechanism; veCRV votes direct CRV emissions to pools
- **Bribes** — payments to veCRV holders to vote emissions toward specific pools (Votium, Hidden Hand)
- **Curve Wars** — competition for veCRV votes / CRV emissions between protocols

### Perps / Derivatives
- **Perpetual futures (perps)** — futures with no expiry; funding rate keeps price near spot
- **Funding rate** — periodic payment between longs and shorts to keep perp price ≈ spot
- **Open Interest (OI)** — total notional value of open positions
- **Mark price** — fair price used for liquidations; oracle-derived, prevents manipulation
- **Leverage** — trading with borrowed capital; 10x = $1K controls $10K position
- **Long / Short** — long profits when price rises; short profits when price falls
- **PnL** — Profit and Loss

### Bridges & Cross-chain
- **Lock-and-mint** — lock tokens on source chain, mint wrapped tokens on destination
- **Burn-and-mint** — burn on source, mint on destination (native cross-chain)
- **Intent-based bridge** — solver fills order instantly, settles on source chain after (Across)
- **Message passing** — general-purpose cross-chain messages (LayerZero, Wormhole, CCIP)
- **OFT** — Omnichain Fungible Token (LayerZero standard)
- **VAA** — Verified Action Approval (Wormhole's signed message)
- **DVN** — Decentralized Verifier Network (LayerZero security model)
- **GMP** — General Message Passing (Axelar)

### NFTs
- **Floor price** — cheapest NFT in a collection available for sale
- **Royalties** — creator fee on secondary sales; optional post-royalty-wars
- **Ordinals / Inscriptions** — Bitcoin NFTs inscribed in satoshi data
- **PFP** — Profile Picture collection (Bored Apes, Pudgy Penguins, etc.)

### Infrastructure
- **Subgraph** — The Graph indexing job; defines events to index, exposes GraphQL API
- **Indexer** — runs subgraphs in The Graph network; earns GRT
- **RPC node** — Remote Procedure Call endpoint; how frontends query chain state
- **Alchemy / Infura** — managed RPC providers

### DAO & Governance
- **DAO** — Decentralized Autonomous Organization
- **Snapshot** — off-chain gasless governance voting
- **On-chain governance** — votes executed directly as contract calls (Compound Governor, Tally)
- **Multisig** — multi-signature wallet requiring M-of-N signers (Safe)
- **Treasury** — DAO-controlled funds; often managed by Gnosis Safe
- **Quorum** — minimum votes required for a proposal to pass

### Wallets & Security
- **Seed phrase / mnemonic** — 12/24 words that generate all private keys; never share
- **Hardware wallet** — Ledger, Trezor; private keys stored offline
- **Smart wallet** — contract-based wallet with social recovery, batching, gas sponsorship
- **Account abstraction (AA)** — ERC-4337; enables smart wallets without consensus changes
- **Passkey wallet** — biometric-secured smart wallet (Coinbase Smart Wallet)
- **Social recovery** — recover wallet via trusted guardians (no seed phrase)
- **Bundler** — node that batches ERC-4337 UserOperations into one tx
- **Paymaster** — sponsors gas fees in ERC-4337 (enables gasless UX)

---

## PM Metrics for Crypto Products

| Metric | Definition | Notes |
|--------|-----------|-------|
| TVL | Total Value Locked | Primary health metric for DeFi |
| DAU/MAU | Daily/Monthly Active Users | On-chain = unique addresses |
| Trading volume | Notional value traded | 24h, 7d, 30d |
| Fee revenue | Total fees paid by users | Before protocol cut |
| Protocol revenue | Fees kept by DAO/treasury | After LP/staker cut |
| FDV | Fully Diluted Valuation | Price × max supply |
| Market cap | Price × circulating supply | Often < FDV |
| Staking ratio | % of supply staked | High = less sell pressure |
| OI | Open Interest | Health of perps market |
| Liquidation volume | Value liquidated | Spike = market stress |
| Bad debt | Unliquidatable debt | Protocol risk indicator |
| Nakamoto coefficient | Min validators for 51% attack | Decentralization metric |
| bribe efficiency | Emissions per $ bribed | Curve Wars metric |

---

## Chain-Specific Concepts

### Ethereum
- **Slots** (12s each) → **Epochs** (32 slots, ~6.4 min) → **Finality** (~2 epochs = ~13 min)
- **Validators** stake 32 ETH; propose and attest blocks
- **Withdrawals** — staked ETH has withdrawal queue; no instant exit
- **EIPs** — Ethereum Improvement Proposals; major ones: EIP-1559 (fee burn), EIP-4844 (blobs), EIP-4337 (AA)
- **Shapella** — enabled staking withdrawals (April 2023)
- **Dencun** — introduced EIP-4844 blobs (March 2024)

### Solana
- **PoH** — Proof of History; SHA-256 chain creating verifiable time
- **Gulf Stream** — mempool-less tx forwarding; reduces confirmation time
- **Turbine** — block propagation via erasure coding
- **Sealevel** — parallel smart contract execution
- **PDA** — Program Derived Address; deterministic contract-owned account
- **ATA** — Associated Token Account; standard account for holding SPL tokens
- **Rent** — SOL deposit required to keep accounts alive; exemption at ~0.002 SOL
- **Compute Units (CU)** — Solana's equivalent of gas

### Cosmos
- **Tendermint / CometBFT** — BFT consensus; instant finality
- **IBC** — Inter-Blockchain Communication; native bridge between Cosmos chains
- **Unbonding period** — 21 days to unstake ATOM (slashing protection)
- **App-chain** — Cosmos chain purpose-built for one app (dYdX, Osmosis, Injective)

### Avalanche
- **C-Chain** — EVM-compatible, where most DeFi lives
- **X-Chain** — UTXO asset chain
- **P-Chain** — staking and subnet coordination
- **Subnets** — custom chains with own validators; can be EVM or non-EVM

### Polkadot
- **Relay chain** — security provider; DOT staked by validators
- **Parachains** — app-chains connected to relay chain; share security
- **XCM** — Cross-Consensus Messaging; Polkadot's cross-chain message format
- **NPoS** — Nominated Proof of Stake; nominators back validators with DOT

---

## Common Crypto Product Patterns

### Wallet Connection Flow
Connect wallet → Sign message (auth) → Read on-chain state → Write txns

### Approval Flow (ERC-20)
`approve(spender, amount)` → `deposit/swap/stake(amount)` — often two separate txns

### Signature Types
- **eth_sign** — dangerous, deprecated
- **personal_sign** — common for auth
- **EIP-712** — typed structured data signing (permits, orders); gas-free approvals

### Permit (EIP-2612)
One signature replaces `approve` + `deposit` → single transaction for better UX

### Transaction States
`pending` → `confirmed` (1 block) → `finalized` (varies by chain)

### Testnet vs Mainnet
Always build on testnet first. Common testnets: Sepolia (ETH), Base Sepolia, Solana Devnet. Use faucets for test tokens.

### Indexing Options
| Tool | Use case |
|------|---------|
| The Graph | Complex event indexing, GraphQL |
| Alchemy Webhooks | Simple event alerts |
| Moralis | Multi-chain NFT + DeFi data |
| Dune Analytics | SQL on-chain analytics |
| Nansen | Wallet labeling + flows |
| DefiLlama | TVL tracking |
