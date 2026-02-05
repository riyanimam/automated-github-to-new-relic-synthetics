# Monitor Templates

This directory contains templates for creating new synthetic monitors.

## How to Use Templates

### Method 1: Copy Template Directory

```bash
# Copy the appropriate template
cp -r templates/scripted-api monitors/scripted-api/my-new-monitor

# Edit the config and script
vim monitors/scripted-api/my-new-monitor/config.json
vim monitors/scripted-api/my-new-monitor/script.js

# Commit and push
git add monitors/scripted-api/my-new-monitor
git commit -m "Add my new monitor"
git push origin main
```

### Method 2: Manual Creation

1. Create a new directory under the appropriate monitor type:
   ```bash
   mkdir -p monitors/scripted-api/my-new-monitor
   ```

2. Copy template files:
   ```bash
   cp templates/scripted-api/config.json monitors/scripted-api/my-new-monitor/
   cp templates/scripted-api/script.js monitors/scripted-api/my-new-monitor/
   ```

3. Edit both files with your specific configuration and logic

4. Commit and push to trigger the sync

## Available Templates

### scripted-api/
Template for API monitoring using HTTP requests.

**Best for:**
- REST API health checks
- API endpoint testing
- Backend service monitoring
- Webhook validation

### scripted-browser/
Template for browser automation using Selenium WebDriver.

**Best for:**
- Complex user interactions
- Multi-step workflows
- Login flows
- Form submissions
- JavaScript-heavy applications

### simple-browser/
Template for basic URL checks without custom scripts.

**Best for:**
- Simple availability checks
- Basic uptime monitoring
- Static page validation
- SSL certificate verification

## Template Structure

Each template contains:
- `config.json` - Monitor configuration with placeholder values
- `script.js` - Monitor script with example code and comments

## Quick Start Example

```bash
# 1. Copy template
cp -r templates/scripted-api monitors/scripted-api/health-check

# 2. Update config.json
cat > monitors/scripted-api/health-check/config.json << 'EOF'
{
  "name": "API Health Check",
  "type": "SCRIPT_API",
  "frequency": 5,
  "locations": ["AWS_US_EAST_1"],
  "status": "ENABLED",
  "options": {
    "slaThreshold": 3.0
  }
}
EOF

# 3. Update script.js
cat > monitors/scripted-api/health-check/script.js << 'EOF'
var assert = require('assert');
$http.get('https://api.example.com/health', function(err, response, body) {
  assert.ok(!err, 'Request error: ' + err);
  assert.equal(response.statusCode, 200);
  var data = JSON.parse(body);
  assert.equal(data.status, 'healthy');
  console.log('✓ Health check passed');
});
EOF

# 4. Deploy
git add monitors/scripted-api/health-check
git commit -m "Add API health check monitor"
git push origin main
```

## Need More Examples?

See [MONITOR_EXAMPLES.md](../MONITOR_EXAMPLES.md) for comprehensive examples of each monitor type.
