# Security Policy

## Supported Versions

We are committed to keeping YieldMind secure. Currently supported versions:

| Component | Version | Supported          |
| --------- | ------- | ------------------ |
| Next.js   | 15.5.12 | :white_check_mark: |
| React     | 19.0.0  | :white_check_mark: |
| Python    | 3.9+    | :white_check_mark: |
| Solidity  | 0.8.20  | :white_check_mark: |

## Recent Security Updates

### 2026-02-18: Next.js Security Update

**Severity**: Critical

**Issue**: Multiple vulnerabilities in Next.js 14.2.13
- DoS vulnerability via HTTP request deserialization in Server Components
- Authorization Bypass in Next.js Middleware
- Multiple incomplete fixes for Server Components DoS

**Fix**: Upgraded Next.js from 14.2.13 → 15.5.12

**CVEs Addressed**:
- GHSA-g5qg-72qw-gw5v (Cache Key Confusion)
- GHSA-xv57-4mr9-wg8v (Content Injection)
- GHSA-4342-x723-ch2f (Middleware Redirect SSRF)
- GHSA-9g9p-9gw9-jx7f (DoS via Image Optimizer)
- Multiple Server Components DoS vulnerabilities

**Status**: ✅ RESOLVED

All critical Next.js vulnerabilities have been patched.

## Security Best Practices

### Smart Contract Security

1. **Access Control**
   - AI agent address is whitelisted
   - Only owner can update AI agent
   - Emergency withdrawal restricted to owner

2. **Input Validation**
   - All protocol addresses validated
   - Delta percentage must be ≥ 2% (200 basis points)
   - Amount checks on deposits/withdrawals

3. **Transparency**
   - All rebalances logged on-chain
   - Event emission for all state changes
   - Public view functions for history

### Backend Security

1. **API Key Management**
   - Never commit `.env` files
   - Use environment variables for secrets
   - Rotate API keys regularly

2. **Private Key Security**
   - Store in secure environment
   - Use hardware wallet for production
   - Limit transaction permissions

3. **Rate Limiting**
   - Implement on production API
   - Protect against DoS attacks
   - Monitor for unusual patterns

### Frontend Security

1. **Dependencies**
   - All dependencies up-to-date
   - Regular security audits
   - Automated vulnerability scanning

2. **CORS Configuration**
   - Restrict to known domains
   - No wildcard in production
   - Validate all origins

## Reporting a Vulnerability

If you discover a security vulnerability in YieldMind:

1. **DO NOT** open a public GitHub issue
2. Email: security@yieldmind.example (or contact repository owner)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will:
- Acknowledge receipt within 48 hours
- Provide an initial assessment within 1 week
- Keep you informed of our progress
- Credit you in our security advisories (if desired)

## Security Checklist for Deployment

Before deploying to production:

- [ ] All dependencies updated to latest secure versions
- [ ] CodeQL security scan passed
- [ ] Smart contract audited by professional firm
- [ ] Private keys stored securely (hardware wallet)
- [ ] Environment variables configured correctly
- [ ] CORS restricted to production domain
- [ ] Rate limiting enabled on API
- [ ] Monitoring and alerting configured
- [ ] Emergency shutdown procedure documented
- [ ] Insurance coverage considered

## Known Limitations

1. **Smart Contract**
   - Protocol addresses are constants (require redeployment to change)
   - No upgrade mechanism (intentional for security)
   - Emergency withdrawal is centralized (owner control)

2. **Backend**
   - Relies on external protocol APIs
   - Single point of failure if server goes down
   - AI decisions depend on Claude API availability

3. **Frontend**
   - Client-side only (no server-side rendering used)
   - Depends on browser wallet security
   - No built-in wallet connection yet

## Security Tools Used

- **CodeQL**: Static analysis for vulnerabilities
- **npm audit**: Dependency vulnerability scanning
- **Hardhat**: Smart contract testing framework
- **TypeScript**: Type safety in frontend
- **Pydantic**: Data validation in backend

## References

- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Anthropic Security](https://www.anthropic.com/security)

---

Last Updated: 2026-02-18
