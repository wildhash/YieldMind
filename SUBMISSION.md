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
Not deployed yet.

## Links
- GitHub: this repository
