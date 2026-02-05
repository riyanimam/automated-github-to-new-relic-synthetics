#!/usr/bin/env node

/**
 * New Relic Synthetics Sync Script
 * 
 * This script synchronizes monitor scripts from the GitHub repository
 * to New Relic Synthetics, creating or updating monitors as needed.
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

// Configuration
const API_KEY = process.env.NEW_RELIC_API_KEY;
const ACCOUNT_ID = process.env.NEW_RELIC_ACCOUNT_ID;
const API_ENDPOINT = process.env.NEW_RELIC_API_ENDPOINT || 'https://synthetics.newrelic.com/synthetics/api/v3';

// Monitor directories
const MONITOR_DIRS = {
  'scripted-browser': 'monitors/scripted-browser',
  'scripted-api': 'monitors/scripted-api',
  'simple-browser': 'monitors/simple-browser'
};

// Validate required environment variables
function validateConfig() {
  if (!API_KEY) {
    throw new Error('NEW_RELIC_API_KEY is required. Please set it in your environment or .env file.');
  }
  if (!ACCOUNT_ID) {
    throw new Error('NEW_RELIC_ACCOUNT_ID is required. Please set it in your environment or .env file.');
  }
  console.log('✓ Configuration validated');
}

// Create axios instance with New Relic API headers
function createApiClient() {
  return axios.create({
    baseURL: API_ENDPOINT,
    headers: {
      'Api-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });
}

// Get all existing monitors from New Relic
async function getExistingMonitors(client) {
  try {
    const response = await client.get('/monitors');
    console.log(`✓ Found ${response.data.monitors.length} existing monitors in New Relic`);
    return response.data.monitors;
  } catch (error) {
    console.error('Error fetching monitors:', error.response?.data || error.message);
    throw error;
  }
}

// Read monitor configuration from JSON file
async function readMonitorConfig(configPath) {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading config file ${configPath}:`, error.message);
    return null;
  }
}

// Read monitor script content
async function readMonitorScript(scriptPath) {
  try {
    return await fs.readFile(scriptPath, 'utf-8');
  } catch (error) {
    console.error(`Error reading script file ${scriptPath}:`, error.message);
    return null;
  }
}

// Create a new monitor in New Relic
async function createMonitor(client, monitorData) {
  try {
    const response = await client.post('/monitors', monitorData);
    console.log(`  ✓ Created monitor: ${monitorData.name} (ID: ${response.data.id})`);
    return response.data;
  } catch (error) {
    console.error(`  ✗ Error creating monitor ${monitorData.name}:`, error.response?.data || error.message);
    throw error;
  }
}

// Update an existing monitor in New Relic
async function updateMonitor(client, monitorId, monitorData) {
  try {
    await client.put(`/monitors/${monitorId}`, monitorData);
    console.log(`  ✓ Updated monitor: ${monitorData.name} (ID: ${monitorId})`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error updating monitor ${monitorData.name}:`, error.response?.data || error.message);
    throw error;
  }
}

// Update monitor script content
async function updateMonitorScript(client, monitorId, scriptContent) {
  try {
    await client.put(`/monitors/${monitorId}/script`, {
      scriptText: scriptContent
    });
    console.log(`  ✓ Updated script for monitor ID: ${monitorId}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error updating script for monitor ${monitorId}:`, error.response?.data || error.message);
    throw error;
  }
}

// Process monitors in a directory
async function processMonitorDirectory(client, monitorType, dirPath, existingMonitors) {
  console.log(`\nProcessing ${monitorType} monitors from ${dirPath}...`);
  
  try {
    const items = await fs.readdir(dirPath);
    const monitorDirs = [];
    
    // Find all monitor directories (each monitor should have its own folder)
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = await fs.stat(itemPath);
      if (stat.isDirectory()) {
        monitorDirs.push(item);
      }
    }
    
    if (monitorDirs.length === 0) {
      console.log(`  No monitors found in ${dirPath}`);
      return;
    }
    
    console.log(`  Found ${monitorDirs.length} monitor(s)`);
    
    // Process each monitor
    for (const monitorDir of monitorDirs) {
      const monitorPath = path.join(dirPath, monitorDir);
      const configPath = path.join(monitorPath, 'config.json');
      const scriptPath = path.join(monitorPath, 'script.js');
      
      // Read monitor configuration
      const config = await readMonitorConfig(configPath);
      if (!config) {
        console.log(`  ⊗ Skipping ${monitorDir}: No valid config.json found`);
        continue;
      }
      
      // Read monitor script
      const script = await readMonitorScript(scriptPath);
      if (!script) {
        console.log(`  ⊗ Skipping ${monitorDir}: No valid script.js found`);
        continue;
      }
      
      console.log(`  Processing: ${config.name || monitorDir}`);
      
      // Prepare monitor data
      const monitorData = {
        name: config.name || monitorDir,
        type: config.type || monitorType.toUpperCase().replace('-', '_'),
        frequency: config.frequency || 10,
        locations: config.locations || ['AWS_US_EAST_1'],
        status: config.status || 'ENABLED',
        uri: config.uri || '',
        ...config.options
      };
      
      // Check if monitor already exists
      const existingMonitor = existingMonitors.find(m => m.name === monitorData.name);
      
      if (existingMonitor) {
        // Update existing monitor
        await updateMonitor(client, existingMonitor.id, monitorData);
        await updateMonitorScript(client, existingMonitor.id, script);
      } else {
        // Create new monitor
        const newMonitor = await createMonitor(client, monitorData);
        await updateMonitorScript(client, newMonitor.id, script);
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`  Directory ${dirPath} not found, skipping...`);
    } else {
      console.error(`  Error processing directory ${dirPath}:`, error.message);
    }
  }
}

// Main sync function
async function syncMonitors() {
  console.log('=== New Relic Synthetics Sync ===\n');
  
  try {
    // Validate configuration
    validateConfig();
    
    // Create API client
    const client = createApiClient();
    
    // Get existing monitors
    const existingMonitors = await getExistingMonitors(client);
    
    // Process each monitor type
    for (const [type, dir] of Object.entries(MONITOR_DIRS)) {
      await processMonitorDirectory(client, type, dir, existingMonitors);
    }
    
    console.log('\n=== Sync Complete ===');
    console.log('✓ All monitors have been synchronized to New Relic Synthetics');
    
  } catch (error) {
    console.error('\n=== Sync Failed ===');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the sync
if (require.main === module) {
  syncMonitors();
}

module.exports = { syncMonitors };
