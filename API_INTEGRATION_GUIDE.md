# API Integration Guide

## Overview
This document describes the complete API integration system for Stalker, including key rotation, error handling, and webhook configuration.

---

## 1. Helius API Integration

### Configuration
Three API keys are configured in `.env` for rotation:

```env
VITE_HELIUS_API_KEY_1=23820805-b04f-45a2-9d4b-e70d588bd406
VITE_HELIUS_API_KEY_2=e8716d73-d001-4b9a-9370-0a4ef7ac8d28
VITE_HELIUS_API_KEY_3=cc0ea229-5dc8-4e7d-9707-7c2692eeefbb
```

### Key Rotation Strategy

**Automatic Rotation:**
- Rotates after every 50 requests per key
- Rotates on rate limit errors (429)
- Rotates on server errors (500+)
- Rotates after 3 consecutive errors per key

**Benefits:**
- Distributes load across multiple API keys
- Prevents rate limiting
- Automatic failover on errors
- Better reliability

### Error Handling

**Retry Logic:**
- Maximum 3 retries per request
- Exponential backoff (1s, 2s, 4s)
- Automatic key rotation on failure
- Graceful fallback to mock data

**Error Tracking:**
- Tracks error count per key
- Logs all API failures
- Monitors key health
- Auto-recovery

### Usage Example

```typescript
import { heliusService } from './services/heliusApi';

// Get wallet transactions
const transactions = await heliusService.getEnhancedTransactions(walletAddress, 50);

// Get wallet balance
const balance = await heliusService.getWalletBalance(walletAddress);

// Get KOL data
const kolData = await heliusService.getRealTimeKOLData();
```

---

## 2. Birdeye API Integration

### Configuration

```env
VITE_BIRDEYE_API_KEY=39a1cc6633a84965a6b29175d0b1dcbb
```

### Features

**Token Prices:**
- Single token price lookup
- Bulk price fetching
- 30-second caching
- Automatic cache management

**Trending Tokens:**
- Top tokens by volume
- Market cap data
- 24h price changes
- Liquidity information

**Token Security:**
- Ownership analysis
- Lock status
- Top holder percentages
- Mint/freeze authority

### Usage Example

```typescript
import { birdeyeService } from './services/birdeyeApi';

// Get single token price
const price = await birdeyeService.getTokenPrice(mintAddress);

// Get multiple prices (cached)
const prices = await birdeyeService.getMultipleTokenPrices([mint1, mint2, mint3]);

// Get trending tokens
const trending = await birdeyeService.getTrendingTokens('rank', 'asc', 0, 50);

// Get token security info
const security = await birdeyeService.getTokenSecurity(mintAddress);
```

---

## 3. Supabase Integration

### Configuration

```env
VITE_SUPABASE_URL=https://swugviyjmqchbriosjoa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Database Tables

**kol_profiles:**
- Trader profiles
- Twitter info
- Verification status
- Avatar URLs

**webhook_transactions:**
- Real-time transactions
- Token transfers
- Swap events
- Timestamps

**monitored_wallets:**
- Tracked wallets
- Alert settings
- Notification preferences

### Usage Example

```typescript
import { walletService } from './services/walletService';

// Get KOL profile
const profile = await walletService.getKOLProfile(walletAddress);

// Get all KOLs
const allKOLs = await walletService.getAllKOLProfiles();

// Create/update profile
await walletService.createOrUpdateKOLProfile({
  wallet_address: address,
  name: 'Trader Name',
  twitter_handle: 'username',
  twitter_followers: 10000
});
```

---

## 4. Webhook System

### Configuration

```env
HELIUS_WEBHOOK_SECRET=stalker-helius-webhook-2024-secure-key
```

### Webhook Endpoint

**URL:**
```
https://swugviyjmqchbriosjoa.supabase.co/functions/v1/helius-webhook
```

**Headers Required:**
```
Content-Type: application/json
X-Webhook-Secret: stalker-helius-webhook-2024-secure-key
```

### Supported Transaction Types

- ADD_TO_POOL
- BUY_ITEM
- CLOSE_ITEM
- DEPOSIT
- FILL_ORDER
- STAKE_SOL
- TOKEN_MINT
- TRANSFER
- UNSTAKE_SOL
- WITHDRAW

### Security

**Authentication:**
- Secret key validation
- Request signature verification
- CORS protection
- Rate limiting

**Data Validation:**
- Schema validation
- Duplicate detection
- Error logging
- Automatic retry

---

## 5. Jupiter API (Fallback)

### Usage

**Public API - No Key Required:**
```
https://price.jup.ag/v4/price?ids={token_mint}
```

**Features:**
- Token price data
- No authentication needed
- Used as fallback
- High reliability

### Implementation

```typescript
// Get SOL price
const response = await fetch('https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112');
const data = await response.json();
const solPrice = data.data['So11111111111111111111111111111111111111112'].price;
```

---

## 6. Error Handling & Logging

### Log Levels

**Info:**
- API connections
- Key rotations
- Successful requests

**Warning:**
- Rate limits
- Retries
- Cache misses

**Error:**
- Failed requests
- Invalid keys
- Network errors

### Example Logs

```
✅ Helius API initialized with 3 keys
🔄 Rotating API key: [0] -> [1] (Used 50 times)
⏳ Rate limited on key [1], rotating and retrying...
✅ Token price fetched in 142ms: 147.5
❌ Key [2] has 3 errors, rotating...
```

---

## 7. Best Practices

### Do's

✅ Use environment variables for all API keys
✅ Implement retry logic with exponential backoff
✅ Cache frequently accessed data
✅ Log all API interactions
✅ Monitor key usage and errors
✅ Rotate keys regularly
✅ Handle failures gracefully

### Don'ts

❌ Don't hardcode API keys in code
❌ Don't make requests without rate limiting
❌ Don't ignore error responses
❌ Don't cache sensitive data
❌ Don't expose keys in frontend
❌ Don't skip error handling
❌ Don't make unlimited retries

---

## 8. Testing

### Test API Connections

```typescript
// Test Helius connection
const connected = await heliusService.testConnection();
console.log('Helius connected:', connected);

// Check key rotation
console.log('Current key index:', heliusService.currentKeyIndex);
```

### Monitor Performance

```typescript
// Check key usage
heliusService.keyUsageCount.forEach((count, index) => {
  console.log(`Key [${index}]: ${count} requests`);
});

// Check error counts
heliusService.keyErrorCount.forEach((count, index) => {
  console.log(`Key [${index}]: ${count} errors`);
});
```

---

## 9. Troubleshooting

### Rate Limiting

**Symptoms:**
- 429 status codes
- Slow responses
- Failed requests

**Solutions:**
- Check key rotation
- Reduce request frequency
- Add more API keys
- Implement request queuing

### Authentication Errors

**Symptoms:**
- 401/403 status codes
- "Invalid API key" messages
- SSL handshake failures

**Solutions:**
- Verify API keys in .env
- Check key expiration
- Validate webhook secret
- Test connection manually

### Data Issues

**Symptoms:**
- Empty responses
- Null values
- Missing data

**Solutions:**
- Check wallet has activity
- Verify token addresses
- Review API rate limits
- Check cache expiration

---

## 10. Monitoring & Maintenance

### Daily Checks

- [ ] Monitor API error rates
- [ ] Review key rotation logs
- [ ] Check webhook deliveries
- [ ] Verify cache hit rates

### Weekly Maintenance

- [ ] Rotate webhook secret
- [ ] Review API usage limits
- [ ] Update token whitelist
- [ ] Clean up old cache entries

### Monthly Tasks

- [ ] Audit API key usage
- [ ] Review error patterns
- [ ] Optimize cache strategy
- [ ] Update API integrations

---

## Support

For issues or questions:
1. Check logs in browser console
2. Review error messages
3. Verify API key configuration
4. Test individual API endpoints
5. Contact API providers if needed

---

**Last Updated:** October 2024
**Version:** 1.0.0
