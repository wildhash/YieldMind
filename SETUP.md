# YieldMind Setup Guide

This guide will help you set up and run YieldMind locally for development or testing.

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Git**
- **Anthropic API Key** (get from https://console.anthropic.com/)
- **BSC Wallet** with private key (for deployment and transactions)

## Step 1: Clone the Repository

```bash
git clone https://github.com/wildhash/YieldMind.git
cd YieldMind
```

## Step 2: Set Up the Backend

### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Get from https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: Claude model ID (must support tool use)
ANTHROPIC_MODEL=claude-opus-4-20250514

# Optional: scheduler interval (minimum 5)
CYCLE_INTERVAL_MINUTES=5

# BSC RPC (you can use public endpoint or get private from Ankr/Infura)
BSC_RPC_URL=https://bsc-dataseed.binance.org/

# Will be set after contract deployment
VAULT_CONTRACT_ADDRESS=

# Your wallet private key (keep secure!)
PRIVATE_KEY=your_private_key_here
```

⚠️ **Security Warning**: Never commit your `.env` file or share your private key!

### Test the Backend

```bash
python main.py
```

You should see:
```
🚀 YieldMind AI Backend started
🤖 AI Agent initialized with Claude Opus 4.5
⏱️  Running optimization cycles every 5 minutes
```

The backend will be available at http://localhost:8000

### API Endpoints

- `GET /` - Backend status
- `GET /docs` - Swagger UI for the OpenAPI schema
- `GET /openapi.json` - OpenAPI schema (useful for generating a typed frontend client)
- `GET /api/protocols` - Get current protocol APYs
- `GET /api/vault/status` - Get vault balance and current protocol
- `GET /api/rebalances` - Get rebalance history
- `POST /api/trigger-cycle` - Manually trigger an optimization cycle

## Step 3: Deploy the Smart Contract

### Install Contract Dependencies

```bash
cd ../contracts
npm install
```

### Compile the Contract

```bash
npm run compile
```

This creates the contract artifacts in `artifacts/` directory.

### Deploy to BSC Testnet (Recommended for Testing)

Edit `hardhat.config.js` to ensure you have the testnet configuration, then:

```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

### Deploy to BSC Mainnet (Production)

⚠️ **Warning**: Make sure you've completed the [DEPLOYMENT.md](./DEPLOYMENT.md) checklist first!

```bash
npx hardhat run scripts/deploy.js --network bsc
```

After deployment, you'll see:
```
YieldMindVault deployed to: 0x...
```

**Copy this address** and update both:
1. `backend/.env` → `VAULT_CONTRACT_ADDRESS=0x...`
2. `frontend/.env.local` → `NEXT_PUBLIC_VAULT_ADDRESS=0x...`

### Verify Contract on BSCScan

```bash
npx hardhat verify --network bsc <CONTRACT_ADDRESS> <AI_AGENT_ADDRESS>
```

## Step 4: Set Up the Frontend

### Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_VAULT_ADDRESS=0x...  # From contract deployment
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
```

### Run Development Server

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```

## Step 5: Using YieldMind

### View the Dashboard

1. Open http://localhost:3000
2. You'll see:
   - **Vault Status**: Total balance in BNB
   - **Protocol Cards**: APY, TVL, and risk scores for each protocol
   - **Rebalance Log**: History of all rebalances

### How the AI Agent Works

The AI agent runs automatically every 5 minutes:

1. **Fetches APY data** from PancakeSwap V3, Venus, and Lista DAO
2. **Analyzes** using Claude Opus 4.5 to calculate risk-adjusted returns
3. **Decides** whether to rebalance (only if delta > 2%)
4. **Executes** the rebalance on-chain if beneficial
5. **Logs** the action in the smart contract

### Manual Trigger

You can manually trigger an optimization cycle:

```bash
curl -X POST http://localhost:8000/api/trigger-cycle
```

Or use the API:
```javascript
fetch('http://localhost:8000/api/trigger-cycle', { method: 'POST' })
```

## Monitoring

### Backend Logs

The backend prints detailed logs:

```
============================================================
🤖 AI Agent Cycle Started at 2026-02-18 09:15:00
============================================================
🎯 AI Decision: Rebalance to Venus for 3.2% improvement
   Should Rebalance: True
   Target: Venus
   Delta: 3.20%
✅ Rebalance executed: 0x...
✅ Cycle completed: Rebalanced: Rebalance to Venus for 3.2% improvement
```

### Check Smart Contract Events

On BSCScan, you can view all `Rebalance` events emitted by the contract.

## Troubleshooting

### Backend won't start

- **Check Python version**: Must be 3.9+
- **Check API key**: Make sure `ANTHROPIC_API_KEY` is valid
- **Check dependencies**: Run `pip install -r requirements.txt` again

### Frontend build fails

- **Check Node version**: Must be 18+
- **Clear cache**: Remove `.next` folder and rebuild
- **Check dependencies**: Run `npm install` again

### Contract won't deploy

- **Check network**: Make sure you're connected to BSC
- **Check private key**: Ensure it's valid and has BNB for gas
- **Check RPC**: Try a different RPC endpoint if one is slow

### AI agent not rebalancing

- **Check delta**: Rebalances only happen when improvement > 2%
- **Check API key**: Make sure Claude API is accessible
- **Check logs**: Look for errors in backend console

## Development Tips

### Testing Without Real Funds

The current implementation uses simulated APY data. For testing:

1. Deploy to BSC testnet first
2. Use testnet BNB (get from faucet)
3. Monitor logs to see AI decisions
4. Adjust the 2% threshold in the contract if needed for testing

### Customizing the AI Agent

Edit `backend/app/ai_agent.py` to:
- Change the cycle interval (default 5 minutes)
- Adjust risk calculation formulas
- Add more protocols
- Modify the rebalance threshold

### Customizing the UI

Edit `frontend/src/app/globals.css` to change:
- Color scheme (currently neon lime #39FF14)
- Fonts
- Animations

## Next Steps

1. Review the [DEPLOYMENT.md](./DEPLOYMENT.md) checklist
2. Test thoroughly on BSC testnet
3. Consider a professional smart contract audit
4. Deploy to mainnet when ready
5. Monitor closely for the first 24 hours

## Need Help?

- Check the [README.md](./README.md) for architecture details
- Review [STRUCTURE.md](./STRUCTURE.md) for code organization
- Open an issue on GitHub for bugs or questions

## Security Reminders

- ✅ Never commit `.env` files
- ✅ Never share your private key
- ✅ Always test on testnet first
- ✅ Use a separate wallet for testing
- ✅ Monitor gas costs closely
- ✅ Set spending limits on the AI agent wallet

Happy optimizing! ⚡
