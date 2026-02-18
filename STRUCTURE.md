# Project Structure

YieldMind/
├── frontend/              # Next.js 14 frontend
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   │   ├── page.tsx  # Main dashboard
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/   # React components
│   │   │   ├── ProtocolCard.tsx
│   │   │   ├── VaultStatus.tsx
│   │   │   └── RebalanceLog.tsx
│   │   └── lib/          # Utilities
│   │       └── constants.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── ai_agent.py   # Claude AI agent
│   │   ├── protocols.py  # Protocol APY fetchers
│   │   ├── vault_manager.py  # Contract interaction
│   │   ├── models.py     # Data models
│   │   └── routes.py     # API routes
│   ├── main.py           # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
├── contracts/            # Solidity smart contracts
│   ├── YieldMindVault.sol
│   ├── hardhat.config.js
│   └── package.json
│
├── scripts/              # Deployment scripts
│   └── deploy.js
│
└── README.md

## Key Files

### Frontend
- `page.tsx` - Main dashboard with real-time data
- `ProtocolCard.tsx` - Displays individual protocol APY/risk
- `VaultStatus.tsx` - Shows vault balance and AI status
- `RebalanceLog.tsx` - Displays rebalance history

### Backend
- `ai_agent.py` - Core AI logic using Claude Opus 4.5
- `protocols.py` - Fetches APY from PancakeSwap, Venus, Lista
- `vault_manager.py` - Interacts with smart contract
- `routes.py` - API endpoints for frontend

### Smart Contracts
- `YieldMindVault.sol` - Main vault contract with rebalance logging
