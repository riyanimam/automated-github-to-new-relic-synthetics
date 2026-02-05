# What You Need to Provide

This document outlines exactly what you need to provide to get the automated GitHub to New Relic Synthetics integration working.

## 🔑 Required Credentials

### 1. New Relic User API Key

**What it is:** A unique authentication token that allows the sync script to access New Relic's API.

**How to get it:**
1. Log in to [New Relic](https://one.newrelic.com)
2. Click your profile name in the bottom-left corner
3. Select **API Keys**
4. Look for an existing **User key** or click **Create a key**
5. If creating new:
   - Key type: **User key**
   - Name: Something descriptive like "GitHub Synthetics Sync"
   - Click **Create a key**
6. **Copy the key immediately** - it starts with `NRAK-`
7. You won't be able to see it again, so save it securely

**Format:** `NRAK-XXXXXXXXXXXXXXXXXXXXXXXXXXXX` (alphanumeric string)

**Where to use it:**
- GitHub Repository Secret: `NEW_RELIC_API_KEY`
- Local .env file: `NEW_RELIC_API_KEY=NRAK-...`

### 2. New Relic Account ID

**What it is:** The unique identifier for your New Relic account.

**How to get it:**
1. Log in to [New Relic](https://one.newrelic.com)
2. Look at your browser's URL bar
3. The URL format is: `https://one.newrelic.com/accounts/{ACCOUNT_ID}/...`
4. The numbers after `/accounts/` are your Account ID

**Example:**
- URL: `https://one.newrelic.com/accounts/1234567/launcher/nr1-core.home`
- Account ID: `1234567`

**Format:** Numeric (e.g., `1234567`)

**Where to use it:**
- GitHub Repository Secret: `NEW_RELIC_ACCOUNT_ID`
- Local .env file: `NEW_RELIC_ACCOUNT_ID=1234567`

## 📝 How to Configure

### For GitHub Actions (Automated Sync)

You need to add these as **GitHub Secrets**:

1. Go to your repository on GitHub
2. Click **Settings** tab (you need admin/owner access)
3. In the left sidebar, expand **Secrets and variables**
4. Click **Actions**
5. Click **New repository secret** button

**Add these two secrets:**

| Secret Name | Value |
|-------------|-------|
| `NEW_RELIC_API_KEY` | Your User API key (NRAK-...) |
| `NEW_RELIC_ACCOUNT_ID` | Your Account ID (numeric) |

### For Local Development (Optional)

If you want to test locally before pushing to GitHub:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```bash
   NEW_RELIC_API_KEY=NRAK-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
   NEW_RELIC_ACCOUNT_ID=1234567
   ```

3. The `.env` file is already in `.gitignore` so it won't be committed

## ✅ Verification Checklist

Before you can use the automation, verify you have:

- [ ] New Relic account with active subscription
- [ ] New Relic User API Key (starts with NRAK-)
- [ ] New Relic Account ID (numeric)
- [ ] GitHub repository access (admin/owner)
- [ ] GitHub Secret: `NEW_RELIC_API_KEY` configured
- [ ] GitHub Secret: `NEW_RELIC_ACCOUNT_ID` configured
- [ ] At least one monitor in `monitors/` directory
- [ ] Monitor has both `config.json` and `script.js` files

## 🔍 How to Verify Your Setup

### Test 1: Verify New Relic Credentials

You can test your credentials work by running the sync script locally:

```bash
# Install dependencies
npm install

# Create .env with your credentials
cp .env.example .env
# Edit .env and add your credentials

# Run the sync
npm run sync
```

If credentials are correct, you should see:
```
=== New Relic Synthetics Sync ===

✓ Configuration validated
✓ Found X existing monitors in New Relic
...
```

If credentials are wrong, you'll see:
```
=== Sync Failed ===
Error: NEW_RELIC_API_KEY is required...
```
or
```
Error fetching monitors: 401 Unauthorized
```

### Test 2: Verify GitHub Integration

1. Make a small change to any monitor:
   ```bash
   # Edit a monitor script
   echo "// Test comment" >> monitors/scripted-api/example-api-check/script.js
   
   # Commit and push
   git add monitors/
   git commit -m "Test sync"
   git push origin main
   ```

2. Go to GitHub → **Actions** tab
3. You should see a workflow run in progress
4. Click on it to watch the logs
5. It should complete successfully

3. Check New Relic:
   - Log in to New Relic
   - Go to **Synthetic Monitoring**
   - Look for your monitors
   - They should be created/updated

## ❌ Common Issues

### "NEW_RELIC_API_KEY is required"

**Cause:** The environment variable or GitHub Secret is not set.

**Solution:**
- For local: Check `.env` file exists and has `NEW_RELIC_API_KEY=...`
- For GitHub: Verify secret name is exactly `NEW_RELIC_API_KEY` (case-sensitive)

### "401 Unauthorized"

**Cause:** The API key is invalid or doesn't have the right permissions.

**Solutions:**
- Verify you're using a **User API key** (not Ingest or Browser key)
- Check the key starts with `NRAK-`
- Verify you copied the entire key without spaces
- Try creating a new API key in New Relic
- Ensure your user has Synthetics permissions

### "Account ID not found"

**Cause:** The Account ID is incorrect.

**Solution:**
- Double-check the Account ID from your New Relic URL
- Ensure it's just the numbers (no letters or special characters)
- Try accessing New Relic and verify you can see Synthetics

### Workflow doesn't trigger

**Cause:** Changes not pushed to main/master branch, or files not in monitors/ directory.

**Solutions:**
- Verify you pushed to `main` or `master` branch
- Check that changed files are in `monitors/` directory
- Look at workflow file paths trigger settings

## 📞 Still Need Help?

If you've verified everything above and it's still not working:

1. Check the GitHub Actions logs for detailed error messages
2. Review the [SETUP_GUIDE.md](SETUP_GUIDE.md) for step-by-step instructions
3. Check New Relic's status page: https://status.newrelic.com/
4. Review [New Relic Synthetics API documentation](https://docs.newrelic.com/docs/apis/synthetics-rest-api/)
5. Open an issue in this repository with:
   - Error message from GitHub Actions
   - Monitor type you're trying to create
   - Confirmation you've set the GitHub Secrets

## 🎯 Summary

**Minimum requirements to get started:**

1. ✅ New Relic User API Key → GitHub Secret `NEW_RELIC_API_KEY`
2. ✅ New Relic Account ID → GitHub Secret `NEW_RELIC_ACCOUNT_ID`
3. ✅ At least one monitor in `monitors/` directory
4. ✅ Push to `main` or `master` branch

That's it! The GitHub Action will handle the rest.
