# Quick Reference

## What You Need to Provide

### Required Credentials

1. **New Relic User API Key** (starts with `NRAK-`)
   - Get it from: New Relic → Profile → API Keys
   - Permissions needed: Synthetics management
   - Add as GitHub Secret: `NEW_RELIC_API_KEY`

2. **New Relic Account ID** (numeric)
   - Find it in URL: `https://one.newrelic.com/accounts/{ACCOUNT_ID}/...`
   - Add as GitHub Secret: `NEW_RELIC_ACCOUNT_ID`

### Required Repository Setup

- GitHub repository with this code
- GitHub Secrets configured (see above)
- Push access to `main` or `master` branch

## How It Works

```
┌─────────────────┐
│  You: Edit      │
│  monitors/*.js  │
└────────┬────────┘
         │
         │ git push
         ▼
┌─────────────────┐
│  GitHub Actions │
│  Workflow Runs  │
└────────┬────────┘
         │
         │ npm run sync
         ▼
┌─────────────────┐
│  Sync Script    │
│  Calls API      │
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│  New Relic      │
│  Synthetics     │
└─────────────────┘
```

## Quick Commands

### Create New Monitor
```bash
# 1. Create directory
mkdir -p monitors/scripted-api/my-monitor

# 2. Create config.json
cat > monitors/scripted-api/my-monitor/config.json << 'EOF'
{
  "name": "My Monitor",
  "type": "SCRIPT_API",
  "frequency": 10,
  "locations": ["AWS_US_EAST_1"],
  "status": "ENABLED"
}
EOF

# 3. Create script.js
cat > monitors/scripted-api/my-monitor/script.js << 'EOF'
var assert = require('assert');
$http.get('https://example.com/api', function(err, response, body) {
  assert.ok(!err, 'Request error: ' + err);
  assert.equal(response.statusCode, 200);
  console.log('✓ Check passed');
});
EOF

# 4. Commit and push
git add monitors/
git commit -m "Add my monitor"
git push origin main
```

### Test Locally
```bash
# 1. Install dependencies
npm install

# 2. Set up .env
cp .env.example .env
# Edit .env with your credentials

# 3. Run sync
npm run sync
```

### Manual Trigger from GitHub
1. Go to repository → Actions tab
2. Select "Sync to New Relic Synthetics"
3. Click "Run workflow"
4. Wait for completion

## Monitor Types

| Type | Use Case | Script Type |
|------|----------|-------------|
| `SCRIPT_BROWSER` | Complex web interactions | Selenium WebDriver |
| `SCRIPT_API` | API testing | HTTP requests |
| `SIMPLE` | Basic URL checks | Config only |

## Frequencies (minutes)
`1`, `5`, `10`, `15`, `30`, `60`, `360`, `720`, `1440`

## Common Locations
- `AWS_US_EAST_1` - US East (Virginia)
- `AWS_US_WEST_1` - US West (N. California)
- `AWS_US_WEST_2` - US West (Oregon)
- `AWS_EU_WEST_1` - EU (Ireland)
- `AWS_AP_SOUTHEAST_1` - Asia Pacific (Singapore)
- `AWS_AP_NORTHEAST_1` - Asia Pacific (Tokyo)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Workflow doesn't run | Check: pushing to main/master, files in monitors/ changed |
| API key error | Verify secret name: `NEW_RELIC_API_KEY` (exact) |
| 401 Unauthorized | Check API key is User key, not Ingest/Browser key |
| Monitor not updating | Verify name in config.json matches New Relic exactly |
| Script error | Check logs in Actions tab for details |

## File Structure Per Monitor

```
monitors/
  {type}/
    {monitor-name}/
      config.json    ← Monitor settings
      script.js      ← Monitor logic
```

## Minimal config.json
```json
{
  "name": "Monitor Name",
  "type": "SCRIPT_API",
  "frequency": 10,
  "locations": ["AWS_US_EAST_1"],
  "status": "ENABLED"
}
```

## Minimal script.js (API)
```javascript
var assert = require('assert');
$http.get('https://example.com', function(err, response, body) {
  assert.ok(!err);
  assert.equal(response.statusCode, 200);
});
```

## Need Help?

- **Full Setup Guide**: See [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Example Monitors**: See [MONITOR_EXAMPLES.md](MONITOR_EXAMPLES.md)
- **Main Documentation**: See [README.md](README.md)
- **New Relic Docs**: https://docs.newrelic.com/docs/synthetics/

## Configuration Fields Reference

### config.json Options

```javascript
{
  "name": String,              // Required: Monitor name
  "type": String,              // Required: SCRIPT_BROWSER | SCRIPT_API | SIMPLE
  "frequency": Number,         // Required: Minutes between checks
  "locations": [String],       // Required: Array of location codes
  "status": String,            // Required: ENABLED | DISABLED
  "uri": String,               // Required for SIMPLE type only
  "options": {                 // Optional additional settings
    "slaThreshold": Number,    // Response time threshold in seconds
    "validationString": String,// For SIMPLE: text to find on page
    "verifySSL": Boolean       // For SIMPLE: verify SSL certificate
  }
}
```

## Environment Variables

Local development (.env file):
```bash
NEW_RELIC_API_KEY=NRAK-...
NEW_RELIC_ACCOUNT_ID=1234567
NEW_RELIC_API_ENDPOINT=https://synthetics.newrelic.com/synthetics/api/v3  # Optional
```

GitHub Secrets (repository settings):
```
NEW_RELIC_API_KEY
NEW_RELIC_ACCOUNT_ID
```

## Common Script Patterns

### API Health Check
```javascript
var assert = require('assert');
$http.get('https://api.example.com/health', function(err, response, body) {
  assert.ok(!err);
  assert.equal(response.statusCode, 200);
  var data = JSON.parse(body);
  assert.equal(data.status, 'healthy');
});
```

### Browser Check
```javascript
$browser.get('https://example.com');
$browser.wait(function() {
  return $browser.isElementPresent($driver.By.id('content'));
}, 10000);
console.log('✓ Page loaded');
```

### Using Secure Credentials
```javascript
// Add credential in New Relic UI first
$http.get('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer ' + $secure.API_TOKEN
  }
}, function(err, response, body) {
  // ...
});
```
