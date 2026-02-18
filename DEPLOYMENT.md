# Deployment Checklist

Before deploying YieldMind to production, complete the following tasks:

## 🔐 Security & Configuration

- [ ] **Smart Contract**
  - [ ] Replace placeholder protocol addresses in `YieldMindVault.sol`:
    - [ ] PANCAKESWAP_V3 with actual PancakeSwap V3 router address
    - [ ] VENUS with actual Venus protocol address  
    - [ ] LISTA_DAO with actual Lista DAO protocol address
  - [ ] Set correct AI agent wallet address
  - [ ] Audit contract with professional security firm
  - [ ] Verify contract on BSCScan after deployment

- [ ] **Backend**
  - [ ] Set secure ANTHROPIC_API_KEY
  - [ ] Set secure PRIVATE_KEY for transaction signing
  - [ ] Update Lista DAO API endpoint in `backend/app/protocols.py`
  - [ ] Implement actual API calls for PancakeSwap and Venus
  - [ ] Configure production BSC RPC endpoint (consider Ankr, Infura, or QuickNode)
  - [ ] Set up proper error logging and monitoring
  - [ ] Configure rate limiting for API endpoints
  - [ ] Set up CORS to allow only your frontend domain

- [ ] **Frontend**
  - [ ] Set NEXT_PUBLIC_VAULT_ADDRESS to deployed contract
  - [ ] Set NEXT_PUBLIC_BACKEND_URL to production backend
  - [ ] Set NEXT_PUBLIC_BSC_RPC_URL to production RPC
  - [ ] Configure proper error boundaries
  - [ ] Add wallet connection (MetaMask, WalletConnect)
  - [ ] Implement deposit/withdraw UI

## 🧪 Testing

- [ ] Test smart contract on BSC Testnet
- [ ] Verify rebalance logic with test funds
- [ ] Test AI agent cycle execution
- [ ] Verify all API integrations work
- [ ] Load test backend with expected traffic
- [ ] Test frontend on multiple browsers
- [ ] Mobile responsiveness testing

## 📊 Monitoring

- [ ] Set up backend health checks
- [ ] Configure uptime monitoring
- [ ] Set up blockchain event monitoring
- [ ] Create alerts for failed rebalances
- [ ] Set up gas price monitoring
- [ ] Configure Claude API usage alerts

## 🚀 Deployment

- [ ] Deploy contract to BSC mainnet
- [ ] Verify contract on BSCScan
- [ ] Deploy backend to production server
- [ ] Deploy frontend to hosting service (Vercel recommended)
- [ ] Configure environment variables on hosting platforms
- [ ] Set up SSL/TLS certificates
- [ ] Configure CDN for frontend

## 📝 Documentation

- [ ] Create user guide for depositing/withdrawing
- [ ] Document emergency procedures
- [ ] Create API documentation
- [ ] Add troubleshooting guide
- [ ] Write incident response plan

## ⚖️ Legal & Compliance

- [ ] Review regulatory requirements
- [ ] Add terms of service
- [ ] Add privacy policy
- [ ] Consider smart contract insurance
- [ ] Add risk disclaimers

## 💰 Economic Parameters

- [ ] Set minimum rebalance threshold (currently 2%)
- [ ] Configure gas price limits
- [ ] Set vault fees (if applicable)
- [ ] Determine minimum deposit amounts

## 🔄 Post-Deployment

- [ ] Monitor first 24 hours closely
- [ ] Verify first rebalance executes correctly
- [ ] Check gas costs are acceptable
- [ ] Verify Claude API usage is within limits
- [ ] Collect user feedback
- [ ] Plan for iterative improvements
