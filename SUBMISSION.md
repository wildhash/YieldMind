# YieldMind submission

## One-liner
Autonomous AI agent that optimizes DeFi yield on BNB Chain: monitors protocol APYs, decides when to rebalance, executes on-chain, and logs actions transparently.

## Description
YieldMind is an AI-powered yield optimizer for BNB Chain DeFi.

Users deposit into a shared-custody vault contract, while an autonomous Claude-powered backend continuously monitors yield opportunities across supported protocols (currently PancakeSwap V3, Venus, and Lista DAO). Every 5 minutes, the agent runs an optimization cycle: fetching the latest protocol APYs, comparing risk-adjusted returns, and executing a rebalance when the improvement exceeds the configured threshold.

Every rebalance is recorded on-chain in the `YieldMindVault` contract to provide a transparent, verifiable audit trail.

## Tech stack
- **AI:** Claude Opus (tool-use)
- **Chain:** BNB Smart Chain (BSC)
- **Backend:** Python FastAPI + APScheduler
- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Contract:** Solidity (`YieldMindVault.sol`)

## Track
- Primary: Agent (AI x on-chain actions)
- Secondary: DeFi

## On-chain proof
- Network: BNB Smart Chain Mainnet (chainId 56)
- Contract: `YieldMindVault` at `0xe88e351C79c06ed92Bf043965F2a5aAA8F4C9A59`
- Deployment tx: `0x4634f0589413ed42bbdc2a97926e0a78ef8b054d696d190b926a1fce4e97c122`

## Links
- GitHub: this repository
