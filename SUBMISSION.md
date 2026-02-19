# YieldMind submission

## One-liner
Autonomous AI agent for BNB Chain DeFi that monitors APYs, makes rebalance decisions, executes transactions on-chain, and leaves a verifiable audit trail.

## Description
YieldMind is an AI-powered yield optimizer for BNB Chain DeFi.

Users deposit into a shared-custody vault contract, while an autonomous Claude-powered backend continuously monitors yield opportunities across supported protocols (currently PancakeSwap V3, Venus, and Lista DAO). Every 5 minutes, the agent runs an optimization cycle: fetching the latest protocol APYs, comparing risk-adjusted returns, and executing a rebalance when the improvement exceeds the configured threshold.

Every rebalance is recorded on-chain in the `YieldMindVault` contract to provide a transparent, verifiable audit trail.

## Why this is an Agent project
- **Autonomous loop:** fetch data → evaluate risk-adjusted return → decide → execute on-chain.
- **Tool-using AI:** Claude selects protocol actions based on live data and configured risk threshold.
- **Actionability:** decisions are not only recommendations; they trigger smart contract transactions.
- **Verifiability:** contract events + tx history provide objective proof of execution.

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
- Verified source: https://bscscan.com/address/0xe88e351C79c06ed92Bf043965F2a5aAA8F4C9A59#code

## Judge quick-check (2 minutes)
1. Open the verified contract link above and confirm `YieldMindVault` source is published.
2. Inspect deployment tx and contract creation on BSC mainnet.
3. Review repository architecture (`backend` agent loop + `contracts` vault + `frontend` dashboard).
4. Confirm autonomous cycle + rebalance logging behavior in `README.md` and backend modules.

## Links
- GitHub: https://github.com/wildhash/YieldMind
