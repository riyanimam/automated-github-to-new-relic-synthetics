# Automated GitHub to New Relic Synthetics

Automatically synchronize synthetic monitoring scripts from GitHub to New Relic Synthetics. Push your monitor changes to GitHub and watch them deploy automatically to New Relic!

## 🚀 Features

- **Automatic Deployment**: Push changes to GitHub and monitors are automatically created/updated in New Relic
- **Version Control**: All your synthetic monitors are version-controlled in Git
- **Multiple Monitor Types**: Supports Scripted Browser, Scripted API, and Simple Browser monitors
- **Overwrites on Push**: Monitors in New Relic are automatically updated with latest changes
- **Easy Configuration**: Simple JSON configuration per monitor
- **GitHub Actions Integration**: Seamless CI/CD pipeline

## 📋 Prerequisites

Before you begin, you'll need:

1. **New Relic Account**: Active New Relic account with Synthetics access
2. **New Relic API Key**: User API key with permissions to manage Synthetics
3. **New Relic Account ID**: Your New Relic account ID
4. **GitHub Repository**: This repository set up in your GitHub account

## 🔧 Setup Instructions

### 1. Get Your New Relic Credentials

#### Get API Key:
1. Log in to New Relic
2. Click on your profile in the top right
3. Select **API Keys**
4. Create or copy your **User API key** (starts with `NRAK-...`)

#### Get Account ID:
1. Log in to New Relic
2. Look at the URL: `https://one.newrelic.com/accounts/{ACCOUNT_ID}/...`
3. The number in the URL is your Account ID

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:
   - **Name**: `NEW_RELIC_API_KEY`
   - **Value**: Your New Relic User API key
4. Add another secret:
   - **Name**: `NEW_RELIC_ACCOUNT_ID`
   - **Value**: Your New Relic Account ID

### 3. Local Development Setup (Optional)

For local testing before pushing to GitHub:

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your credentials
# NEW_RELIC_API_KEY=your_api_key_here
# NEW_RELIC_ACCOUNT_ID=your_account_id_here

# Test sync locally
npm run sync
```

## 📁 Repository Structure

```
.
├── monitors/
│   ├── scripted-browser/     # Browser automation scripts
│   │   └── example-website-check/
│   │       ├── config.json   # Monitor configuration
│   │       └── script.js     # Monitor script
│   ├── scripted-api/         # API testing scripts
│   │   └── example-api-check/
│   │       ├── config.json
│   │       └── script.js
│   └── simple-browser/       # Simple ping monitors
│       └── example-simple-check/
│           ├── config.json
│           └── script.js
├── templates/                # Templates for new monitors
│   ├── scripted-browser/
│   ├── scripted-api/
│   └── simple-browser/
├── scripts/
│   └── sync-to-newrelic.js  # Sync script
├── .github/
│   └── workflows/
│       └── sync-to-newrelic.yml  # GitHub Actions workflow
└── package.json
```

## 📝 Creating a New Monitor

### Quick Start with Templates

The fastest way to create a new monitor is to copy from the templates:

```bash
# Copy template for your monitor type
cp -r templates/scripted-api monitors/scripted-api/my-new-monitor

# Edit the config and script files
# Then commit and push!
```

See [templates/README.md](templates/README.md) for more details.

### Step 1: Create Monitor Directory

Choose the appropriate monitor type and create a new directory:

```bash
# For browser automation
mkdir -p monitors/scripted-browser/my-new-monitor

# For API testing
mkdir -p monitors/scripted-api/my-api-monitor

# For simple URL checks
mkdir -p monitors/simple-browser/my-simple-monitor
```

### Step 2: Create config.json

Create a `config.json` file in your monitor directory:

#### Scripted Browser Example:
```json
{
  "name": "My Website Check",
  "type": "SCRIPT_BROWSER",
  "frequency": 10,
  "locations": ["AWS_US_EAST_1"],
  "status": "ENABLED",
  "options": {
    "slaThreshold": 7.0
  }
}
```

#### Scripted API Example:
```json
{
  "name": "My API Check",
  "type": "SCRIPT_API",
  "frequency": 5,
  "locations": ["AWS_US_EAST_1", "AWS_US_WEST_1"],
  "status": "ENABLED",
  "options": {
    "slaThreshold": 5.0
  }
}
```

#### Simple Browser Example:
```json
{
  "name": "My Simple Check",
  "type": "SIMPLE",
  "frequency": 10,
  "uri": "https://example.com",
  "locations": ["AWS_US_EAST_1"],
  "status": "ENABLED",
  "options": {
    "validationString": "Welcome",
    "verifySSL": true,
    "slaThreshold": 7.0
  }
}
```

### Step 3: Create script.js

Create a `script.js` file with your monitor logic:

#### Scripted Browser Example:
```javascript
// Visit a website and verify content
$browser.get('https://example.com');

$browser.wait(function() {
  return $browser.isElementPresent($driver.By.tagName('h1'));
}, 10000, 'Timeout waiting for page to load');

$browser.findElement($driver.By.tagName('h1')).getText().then(function(text) {
  console.log('H1 text: ' + text);
  if (text.indexOf('Expected Text') === -1) {
    throw new Error('Page content validation failed');
  }
});

console.log('✓ Check completed successfully');
```

#### Scripted API Example:
```javascript
var assert = require('assert');

$http.get('https://api.example.com/health', {
  headers: {
    'Authorization': 'Bearer ' + $secure.API_TOKEN
  }
}, function(err, response, body) {
  assert.ok(!err, 'Error making request: ' + err);
  assert.equal(response.statusCode, 200, 'Expected status code 200');
  
  var data = JSON.parse(body);
  assert.equal(data.status, 'healthy', 'API should be healthy');
  
  console.log('✓ API check completed successfully');
});
```

### Step 4: Commit and Push

```bash
git add monitors/
git commit -m "Add new monitor"
git push origin main
```

The GitHub Action will automatically sync your monitor to New Relic!

## ⚙️ Configuration Options

### Monitor Frequencies
Available frequency options (in minutes):
- `1`, `5`, `10`, `15`, `30`, `60`, `360`, `720`, `1440`

### Available Locations
Common locations include:
- `AWS_US_EAST_1`
- `AWS_US_WEST_1`
- `AWS_US_WEST_2`
- `AWS_EU_WEST_1`
- `AWS_AP_SOUTHEAST_1`
- `AWS_AP_NORTHEAST_1`

See [New Relic Documentation](https://docs.newrelic.com/docs/synthetics/) for full list.

### Monitor Status
- `ENABLED`: Monitor is active
- `DISABLED`: Monitor is paused

## 🔄 How It Works

1. **You Push Changes**: Commit and push monitor changes to the `main` or `master` branch
2. **GitHub Action Triggers**: Workflow runs automatically when files in `monitors/` change
3. **Sync Script Executes**: Script reads all monitor configurations and scripts
4. **API Calls**: Script calls New Relic Synthetics API to create/update monitors
5. **Monitors Updated**: Your monitors are now live in New Relic with the latest changes!

### Behavior:
- **New Monitors**: If a monitor name doesn't exist, it's created
- **Existing Monitors**: If a monitor name exists, both configuration and script are updated
- **Overwrites**: Changes always overwrite the existing monitor in New Relic

## 🛠️ Manual Sync

You can also trigger the sync manually:

### From GitHub UI:
1. Go to **Actions** tab
2. Select **Sync to New Relic Synthetics** workflow
3. Click **Run workflow** button

### From Command Line:
```bash
npm run sync
```

## 🐛 Troubleshooting

### Common Issues:

**Error: NEW_RELIC_API_KEY is required**
- Make sure GitHub secrets are properly configured
- For local dev, check your `.env` file

**Error: 401 Unauthorized**
- Verify your API key is correct and active
- Ensure the API key has Synthetics permissions

**Monitor not updating**
- Check that the monitor name in `config.json` matches exactly
- Names are case-sensitive and must match the name in New Relic

**Workflow not triggering**
- Ensure changes are pushed to `main` or `master` branch
- Check that modified files are in `monitors/` directory

## 📚 Additional Resources

- [New Relic Synthetics API Documentation](https://docs.newrelic.com/docs/apis/synthetics-rest-api/)
- [New Relic Synthetics Scripting Reference](https://docs.newrelic.com/docs/synthetics/synthetic-monitoring/scripting-monitors/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contributing

Feel free to open issues or submit pull requests for improvements!

## 📄 License

MIT License - See LICENSE file for details