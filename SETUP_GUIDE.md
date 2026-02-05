# Setup Guide

This guide provides detailed step-by-step instructions for setting up the automated GitHub to New Relic Synthetics integration.

## Quick Start Checklist

- [ ] New Relic account with Synthetics access
- [ ] New Relic User API Key
- [ ] New Relic Account ID
- [ ] GitHub repository access
- [ ] GitHub Secrets configured

## Detailed Setup

### Part 1: New Relic Configuration

#### 1.1 Access New Relic API Keys

1. Log into [New Relic](https://one.newrelic.com)
2. Click on your name in the bottom-left corner
3. Select **API Keys** from the menu
4. You'll see the API Keys page

#### 1.2 Create or Get User API Key

**Important**: You need a **User API Key** (not Ingest or Browser keys)

1. On the API Keys page, look for **User keys**
2. If you have an existing key:
   - Click the **...** menu next to the key
   - Select **Copy key**
   - Save it securely (starts with `NRAK-`)
3. If you need to create a new key:
   - Click **Create a key**
   - Select **User key**
   - Give it a name (e.g., "GitHub Synthetics Sync")
   - Click **Create a key**
   - Copy and save the key immediately (you won't see it again!)

#### 1.3 Find Your Account ID

1. While logged into New Relic, look at the browser URL
2. The URL will look like: `https://one.newrelic.com/accounts/{ACCOUNT_ID}/...`
3. The numbers after `/accounts/` are your Account ID
4. Example: If URL is `https://one.newrelic.com/accounts/1234567/...`, your Account ID is `1234567`

### Part 2: GitHub Repository Configuration

#### 2.1 Fork or Clone This Repository

If you haven't already:

```bash
# Clone the repository
git clone https://github.com/riyanimam/automated-github-to-new-relic-synthetics.git
cd automated-github-to-new-relic-synthetics

# Or fork it on GitHub and clone your fork
```

#### 2.2 Configure GitHub Secrets

GitHub Secrets allow the workflow to access your New Relic credentials securely.

1. Go to your repository on GitHub
2. Click **Settings** (you need admin access)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

**Add First Secret:**
- Name: `NEW_RELIC_API_KEY`
- Value: Your New Relic User API key (from Part 1.2)
- Click **Add secret**

**Add Second Secret:**
- Click **New repository secret** again
- Name: `NEW_RELIC_ACCOUNT_ID`
- Value: Your New Relic Account ID (from Part 1.3)
- Click **Add secret**

#### 2.3 Verify Workflow File

The workflow file should exist at `.github/workflows/sync-to-newrelic.yml`. It's already included in this repository.

To verify:
```bash
cat .github/workflows/sync-to-newrelic.yml
```

### Part 3: Create Your First Monitor

#### 3.1 Choose Monitor Type

Decide which type of monitor you need:
- **Scripted Browser**: For testing user interactions and complex web workflows
- **Scripted API**: For testing REST APIs and backend services  
- **Simple Browser**: For basic URL availability checks

#### 3.2 Create Monitor Files

Example for a Scripted API monitor:

```bash
# Create directory
mkdir -p monitors/scripted-api/my-first-monitor

# Create config.json
cat > monitors/scripted-api/my-first-monitor/config.json << 'EOF'
{
  "name": "My First API Monitor",
  "type": "SCRIPT_API",
  "frequency": 10,
  "locations": ["AWS_US_EAST_1"],
  "status": "ENABLED",
  "options": {
    "slaThreshold": 7.0
  }
}
EOF

# Create script.js
cat > monitors/scripted-api/my-first-monitor/script.js << 'EOF'
var assert = require('assert');

$http.get('https://jsonplaceholder.typicode.com/posts/1', function(err, response, body) {
  assert.ok(!err, 'Error making request: ' + err);
  assert.equal(response.statusCode, 200, 'Expected status code 200');
  console.log('✓ API check completed successfully');
});
EOF
```

#### 3.3 Test Locally (Optional)

Before pushing to GitHub, you can test locally:

```bash
# Install dependencies
npm install

# Create .env file with your credentials
cp .env.example .env

# Edit .env and add:
# NEW_RELIC_API_KEY=your_key_here
# NEW_RELIC_ACCOUNT_ID=your_account_id_here

# Run sync
npm run sync
```

#### 3.4 Push to GitHub

```bash
# Add your changes
git add monitors/

# Commit
git commit -m "Add my first monitor"

# Push to main branch
git push origin main
```

#### 3.5 Watch the Action Run

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You should see a workflow run in progress
4. Click on it to see the logs
5. Wait for it to complete successfully

#### 3.6 Verify in New Relic

1. Log into New Relic
2. Go to **Synthetic Monitoring**
3. You should see your new monitor listed
4. Click on it to view details and results

### Part 4: Making Changes

#### 4.1 Update a Monitor

To update an existing monitor:

1. Edit the `config.json` or `script.js` file in your monitor directory
2. Commit and push the changes
3. The GitHub Action will automatically update the monitor in New Relic

Example:
```bash
# Edit the script
vim monitors/scripted-api/my-first-monitor/script.js

# Commit and push
git add monitors/scripted-api/my-first-monitor/script.js
git commit -m "Update API monitor to check additional fields"
git push origin main
```

#### 4.2 Add More Monitors

Simply create new directories under the appropriate monitor type folder:

```bash
# Add a browser monitor
mkdir -p monitors/scripted-browser/login-test
# ... create config.json and script.js

# Add another API monitor  
mkdir -p monitors/scripted-api/health-check
# ... create config.json and script.js

# Commit all
git add monitors/
git commit -m "Add login test and health check monitors"
git push origin main
```

#### 4.3 Disable a Monitor

To disable a monitor without deleting it:

1. Edit the `config.json` file
2. Change `"status": "ENABLED"` to `"status": "DISABLED"`
3. Commit and push

### Part 5: Advanced Configuration

#### 5.1 Using Secure Credentials in Scripts

For API keys or passwords in your monitor scripts:

1. Go to New Relic → Synthetic Monitoring → Secure credentials
2. Add your credentials there
3. Reference them in scripts using `$secure.CREDENTIAL_NAME`

Example:
```javascript
$http.get('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer ' + $secure.API_TOKEN
  }
}, function(err, response, body) {
  // ... your test logic
});
```

#### 5.2 Multiple Locations

To run monitors from multiple locations, update config.json:

```json
{
  "name": "Global API Check",
  "type": "SCRIPT_API",
  "frequency": 5,
  "locations": [
    "AWS_US_EAST_1",
    "AWS_US_WEST_1",
    "AWS_EU_WEST_1",
    "AWS_AP_SOUTHEAST_1"
  ],
  "status": "ENABLED"
}
```

#### 5.3 Alert Conditions

After monitors are created, set up alert conditions in New Relic:

1. Go to **Alerts & AI** → **Alert Conditions**
2. Create new alert condition
3. Select your synthetic monitor
4. Configure thresholds and notification channels

## Troubleshooting

### Workflow Fails with "API Key Required"

**Problem**: GitHub Action can't find your API key

**Solution**:
1. Verify secrets are named exactly: `NEW_RELIC_API_KEY` and `NEW_RELIC_ACCOUNT_ID`
2. Secrets are case-sensitive
3. Re-add the secrets if needed

### Monitor Not Updating

**Problem**: Changes pushed but monitor not updating in New Relic

**Solution**:
1. Check that monitor name in config.json exactly matches the name in New Relic
2. Names are case-sensitive
3. Check GitHub Action logs for errors

### 401 Unauthorized Error

**Problem**: API returns 401 error

**Solution**:
1. Verify your API key is a **User API Key** (starts with NRAK-)
2. Check that the key hasn't been deleted or rotated
3. Ensure your user has Synthetics permissions in New Relic

### Monitor Created but Script Empty

**Problem**: Monitor appears in New Relic but has no script

**Solution**:
1. Check that `script.js` file exists in monitor directory
2. Verify script.js is not empty
3. Check GitHub Action logs for script upload errors

## Getting Help

If you encounter issues:

1. Check the GitHub Action logs (Actions tab → Select run → View logs)
2. Review this guide for common issues
3. Check New Relic API documentation
4. Open an issue in this repository

## Next Steps

Now that you're set up:

1. Review the example monitors in the `monitors/` directory
2. Create monitors for your critical services
3. Set up alert conditions in New Relic
4. Configure notification channels for alerts
5. Review monitor results regularly

Congratulations! Your GitHub to New Relic Synthetics integration is now fully configured! 🎉
