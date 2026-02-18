# YieldMind AI DeFi Optimizer

> Your AI co-pilot for DeFi yield on BNB Chain

YieldMind is a full-stack AI-powered yield optimizer that automatically rebalances your crypto assets across the best DeFi protocols on BNB Chain (BSC). Using Claude Opus 4.5, it analyzes APY rates from PancakeSwap V3, Venus, and Lista DAO every 5 minutes and executes smart rebalances when opportunities exceed 2%.

Submission details live in `SUBMISSION.md`.

## 🌟 Features

- **AI-Powered Optimization**: Claude Opus 4.5 analyzes risk-adjusted returns across multiple protocols
- **Automated Rebalancing**: Executes on-chain rebalances when delta > 2%
- **Multi-Protocol Support**: Integrates with PancakeSwap V3, Venus, and Lista DAO
- **Real-Time Monitoring**: Live dashboard with neon lime terminal UI
- **On-Chain Transparency**: All actions logged in the YieldMindVault smart contract
- **5-Minute Cycles**: Continuous optimization running 24/7

## 🏗️ Architecture

### Frontend (Next.js 15 + TypeScript)
- Dark terminal UI with neon lime theme
- Real-time protocol APY display
- Live rebalance history
- Vault balance tracking

### Backend (Python FastAPI)
- Claude Opus 4.5 AI agent
- APY fetching from DeFi protocols
- Risk-adjusted return calculations
- Automated 5-minute optimization cycles

### Smart Contracts (Solidity)
- YieldMindVault.sol on BSC
- On-chain rebalance logging
- User deposit/withdraw management
- AI agent access control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- An Anthropic API key for Claude
- BSC wallet with BNB for gas

### 1. Clone and Setup

```bash
git clone https://github.com/wildhash/YieldMind.git
cd YieldMind
```

### 2. Deploy Smart Contract

```bash
cd contracts
npm install
cp ../backend/.env.example ../backend/.env
# Edit backend/.env and add your PRIVATE_KEY and other variables
npm run compile
npm run deploy
# Copy the deployed contract address
```

### 3. Setup Backend

```bash
cd ../backend
pip install -r requirements.txt
# Edit .env and add:
# - ANTHROPIC_API_KEY
# - VAULT_CONTRACT_ADDRESS (from deployment)
python main.py
```

The backend will start on http://localhost:8000 and run AI cycles every 5 minutes.

### 4. Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local and add NEXT_PUBLIC_VAULT_ADDRESS
npm run dev
```

Visit http://localhost:3000 to see the dashboard.

## 📊 How It Works

1. **Data Collection**: Every 5 minutes, the AI agent fetches APY data from:
   - PancakeSwap V3 (DEX pools)
   - Venus (Lending protocol)
   - Lista DAO (Liquid staking)

2. **AI Analysis**: Claude Opus 4.5 calculates risk-adjusted returns:
   ```
   Risk-Adjusted Return = APY / (1 + risk_score/10)
   ```

3. **Decision Making**: If the best opportunity exceeds current allocation by >2%, the AI recommends a rebalance.

4. **Execution**: The backend calls the vault contract's `executeRebalance()` function, logging the action on-chain.

5. **Monitoring**: The frontend displays real-time status and history.

## 🎨 UI Preview

The dashboard features a dark terminal aesthetic with neon lime (#39FF14) accents:
- Protocol cards showing APY, TVL, and risk scores
- Vault balance with AI status indicator
- Real-time rebalance event log
- Pulsing animations for active protocols

## 🔧 Configuration

### Backend Environment Variables
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
BSC_RPC_URL=https://bsc-dataseed.binance.org/
VAULT_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_private_key
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
```

## 📝 Smart Contract Functions

### User Functions
- `deposit()` - Deposit BNB into the vault
- `withdraw(uint256 amount)` - Withdraw your deposits

### AI Agent Functions
- `executeRebalance(address toProtocol, string reason, uint256 delta)` - Execute rebalance

### View Functions
- `getBalance()` - Get vault balance
- `getRebalanceCount()` - Get number of rebalances
- `getRebalanceLog(uint256 index)` - Get rebalance details

## 🔒 Security

- AI agent address is whitelisted in the smart contract
- Rebalances require minimum 2% delta to prevent gas waste
- Emergency withdraw function for owner
- All actions logged on-chain for transparency

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Contract Tests
```bash
cd contracts
npx hardhat test
```

## 📈 Performance

- **Cycle Time**: 5 minutes
- **Minimum Delta**: 2% for rebalance
- **Gas Optimization**: Batched transactions
- **Uptime**: 24/7 automated operation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, ethers.js
- **Backend**: Python, FastAPI, Anthropic SDK, Web3.py
- **Blockchain**: Solidity 0.8.20, Hardhat, BSC
- **AI**: Claude Opus 4.5 with tool-use API

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## 🔗 Links

- [BNB Chain](https://www.bnbchain.org/)
- [PancakeSwap](https://pancakeswap.finance/)
- [Venus Protocol](https://venus.io/)
- [Lista DAO](https://lista.org/)
- [Anthropic Claude](https://www.anthropic.com/claude)

## 💬 Support

For issues and questions, please open a GitHub issue.

---

Built with ⚡ by the YieldMind team
