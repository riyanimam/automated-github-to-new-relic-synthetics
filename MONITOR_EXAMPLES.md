# Monitor Examples

This document provides comprehensive examples for different types of New Relic Synthetic monitors.

## Table of Contents
- [Scripted Browser Monitors](#scripted-browser-monitors)
- [Scripted API Monitors](#scripted-api-monitors)
- [Simple Browser Monitors](#simple-browser-monitors)
- [Advanced Patterns](#advanced-patterns)

---

## Scripted Browser Monitors

Scripted Browser monitors use Selenium WebDriver to automate browser interactions.

### Example 1: Login Flow Test

**Directory**: `monitors/scripted-browser/login-flow/`

**config.json**:
```json
{
  "name": "Login Flow Test",
  "type": "SCRIPT_BROWSER",
  "frequency": 15,
  "locations": ["AWS_US_EAST_1"],
  "status": "ENABLED",
  "options": {
    "slaThreshold": 10.0
  }
}
```

**script.js**:
```javascript
// Navigate to login page
$browser.get('https://example.com/login');

// Wait for login form
$browser.wait(function() {
  return $browser.isElementPresent($driver.By.id('username'));
}, 10000, 'Login form not found');

// Enter credentials (use $secure for real credentials)
$browser.findElement($driver.By.id('username')).sendKeys('testuser');
$browser.findElement($driver.By.id('password')).sendKeys($secure.TEST_PASSWORD);

// Click login button
$browser.findElement($driver.By.id('login-button')).click();

// Wait for dashboard to load
$browser.wait(function() {
  return $browser.isElementPresent($driver.By.className('dashboard'));
}, 15000, 'Dashboard not loaded');

// Verify successful login
$browser.getCurrentUrl().then(function(url) {
  if (url.indexOf('/dashboard') === -1) {
    throw new Error('Login failed - not redirected to dashboard');
  }
  console.log('✓ Login successful');
});
```

### Example 2: E-commerce Checkout Flow

**Directory**: `monitors/scripted-browser/checkout-flow/`

**config.json**:
```json
{
  "name": "Checkout Flow Test",
  "type": "SCRIPT_BROWSER",
  "frequency": 30,
  "locations": ["AWS_US_EAST_1", "AWS_EU_WEST_1"],
  "status": "ENABLED",
  "options": {
    "slaThreshold": 15.0
  }
}
```

**script.js**:
```javascript
// Step 1: Visit homepage
$browser.get('https://shop.example.com');
console.log('Step 1: Homepage loaded');

// Step 2: Search for product
$browser.findElement($driver.By.id('search-box')).sendKeys('laptop');
$browser.findElement($driver.By.id('search-button')).click();

$browser.wait(function() {
  return $browser.isElementPresent($driver.By.className('product-item'));
}, 10000);
console.log('Step 2: Search results displayed');

// Step 3: Click first product
$browser.findElement($driver.By.className('product-item')).click();

$browser.wait(function() {
  return $browser.isElementPresent($driver.By.id('add-to-cart'));
}, 10000);
console.log('Step 3: Product page loaded');

// Step 4: Add to cart
$browser.findElement($driver.By.id('add-to-cart')).click();

$browser.wait(function() {
  return $browser.isElementPresent($driver.By.className('cart-notification'));
}, 5000);
console.log('Step 4: Product added to cart');

// Step 5: Go to checkout
$browser.findElement($driver.By.id('checkout-button')).click();

$browser.wait(function() {
  return $browser.getCurrentUrl().then(function(url) {
    return url.indexOf('/checkout') !== -1;
  });
}, 10000);
console.log('Step 5: Checkout page loaded');

console.log('✓ Checkout flow test completed successfully');
```

### Example 3: Form Submission

**Directory**: `monitors/scripted-browser/contact-form/`

**config.json**:
```json
{
  "name": "Contact Form Test",
  "type": "SCRIPT_BROWSER",
  "frequency": 10,
  "locations": ["AWS_US_WEST_1"],
  "status": "ENABLED",
  "options": {
    "slaThreshold": 7.0
  }
}
```

**script.js**:
```javascript
// Visit contact page
$browser.get('https://example.com/contact');

// Wait for form to load
$browser.wait(function() {
  return $browser.isElementPresent($driver.By.name('name'));
}, 10000);

// Fill out form
$browser.findElement($driver.By.name('name')).sendKeys('Test User');
$browser.findElement($driver.By.name('email')).sendKeys('test@example.com');
$browser.findElement($driver.By.name('message')).sendKeys('This is a test message');

// Submit form
$browser.findElement($driver.By.id('submit-button')).click();

// Wait for success message
$browser.wait(function() {
  return $browser.isElementPresent($driver.By.className('success-message'));
}, 10000);

// Verify success message text
$browser.findElement($driver.By.className('success-message')).getText().then(function(text) {
  if (text.indexOf('Thank you') === -1) {
    throw new Error('Expected success message not found');
  }
  console.log('✓ Form submitted successfully');
});
```

---

## Scripted API Monitors

Scripted API monitors test REST APIs and backend services.

### Example 1: REST API Health Check

**Directory**: `monitors/scripted-api/api-health/`

**config.json**:
```json
{
  "name": "API Health Check",
  "type": "SCRIPT_API",
  "frequency": 5,
  "locations": ["AWS_US_EAST_1", "AWS_US_WEST_1"],
  "status": "ENABLED",
  "options": {
    "slaThreshold": 3.0
  }
}
```

**script.js**:
```javascript
var assert = require('assert');

$http.get('https://api.example.com/health', function(err, response, body) {
  // Check for network errors
  assert.ok(!err, 'Network error: ' + err);
  
  // Log response time
  console.log('Response time: ' + response.timingPhases.total + 'ms');
  
  // Check status code
  assert.equal(response.statusCode, 200, 'Expected 200 status code');
  
  // Parse response
  var data = JSON.parse(body);
  
  // Validate health status
  assert.equal(data.status, 'healthy', 'API should be healthy');
  assert.ok(data.version, 'Response should include version');
  
  console.log('API Version: ' + data.version);
  console.log('✓ Health check passed');
});
```

### Example 2: Authenticated API Request

**Directory**: `monitors/scripted-api/authenticated-api/`

**config.json**:
```json
{
  "name": "Authenticated API Test",
  "type": "SCRIPT_API",
  "frequency": 10,
  "locations": ["AWS_US_EAST_1"],
  "status": "ENABLED",
  "options": {
    "slaThreshold": 5.0
  }
}
```

**script.js**:
```javascript
var assert = require('assert');

// Make authenticated request
var options = {
  url: 'https://api.example.com/user/profile',
  headers: {
    'Authorization': 'Bearer ' + $secure.API_TOKEN,
    'Content-Type': 'application/json'
  }
};

$http.get(options, function(err, response, body) {
  assert.ok(!err, 'Request error: ' + err);
  assert.equal(response.statusCode, 200, 'Expected 200 status');
  
  var data = JSON.parse(body);
  
  // Validate response structure
  assert.ok(data.user, 'Response should contain user object');
  assert.ok(data.user.id, 'User should have an ID');
  assert.ok(data.user.email, 'User should have an email');
  
  console.log('User ID: ' + data.user.id);
  console.log('✓ Authenticated API test passed');
});
```

### Example 3: POST Request with Validation

**Directory**: `monitors/scripted-api/post-request/`

**config.json**:
```json
{
  "name": "POST Request Test",
  "type": "SCRIPT_API",
  "frequency": 15,
  "locations": ["AWS_US_EAST_1"],
  "status": "ENABLED",
  "options": {
    "slaThreshold": 7.0
  }
}
```

**script.js**:
```javascript
var assert = require('assert');

// Prepare POST data
var postData = {
  title: 'Test Post',
  body: 'This is a test',
  userId: 1
};

var options = {
  url: 'https://jsonplaceholder.typicode.com/posts',
  body: JSON.stringify(postData),
  headers: {
    'Content-Type': 'application/json'
  }
};

$http.post(options, function(err, response, body) {
  assert.ok(!err, 'Request error: ' + err);
  
  // Check status code
  assert.equal(response.statusCode, 201, 'Expected 201 Created status');
  
  // Parse and validate response
  var data = JSON.parse(body);
  assert.ok(data.id, 'Response should contain ID of created resource');
  assert.equal(data.title, postData.title, 'Title should match');
  assert.equal(data.body, postData.body, 'Body should match');
  
  console.log('Created resource ID: ' + data.id);
  console.log('✓ POST request test passed');
});
```

### Example 4: Multi-Step API Flow

**Directory**: `monitors/scripted-api/multi-step/`

**config.json**:
```json
{
  "name": "Multi-Step API Flow",
  "type": "SCRIPT_API",
  "frequency": 10,
  "locations": ["AWS_US_EAST_1"],
  "status": "ENABLED",
  "options": {
    "slaThreshold": 10.0
  }
}
```

**script.js**:
```javascript
var assert = require('assert');

// Step 1: Get list of items
$http.get('https://jsonplaceholder.typicode.com/posts', function(err, response, body) {
  assert.ok(!err, 'Step 1 error: ' + err);
  assert.equal(response.statusCode, 200);
  
  var posts = JSON.parse(body);
  console.log('Step 1: Retrieved ' + posts.length + ' posts');
  
  // Step 2: Get details of first item
  var firstPostId = posts[0].id;
  $http.get('https://jsonplaceholder.typicode.com/posts/' + firstPostId, function(err, response, body) {
    assert.ok(!err, 'Step 2 error: ' + err);
    assert.equal(response.statusCode, 200);
    
    var post = JSON.parse(body);
    console.log('Step 2: Retrieved post details - ' + post.title);
    
    // Step 3: Get comments for the post
    $http.get('https://jsonplaceholder.typicode.com/posts/' + firstPostId + '/comments', function(err, response, body) {
      assert.ok(!err, 'Step 3 error: ' + err);
      assert.equal(response.statusCode, 200);
      
      var comments = JSON.parse(body);
      console.log('Step 3: Retrieved ' + comments.length + ' comments');
      console.log('✓ Multi-step API flow completed');
    });
  });
});
```

---

## Simple Browser Monitors

Simple Browser monitors are the easiest to configure - they just ping a URL.

### Example 1: Simple URL Check

**Directory**: `monitors/simple-browser/homepage-check/`

**config.json**:
```json
{
  "name": "Homepage Availability",
  "type": "SIMPLE",
  "frequency": 5,
  "uri": "https://example.com",
  "locations": ["AWS_US_EAST_1", "AWS_EU_WEST_1"],
  "status": "ENABLED",
  "options": {
    "validationString": "Welcome",
    "verifySSL": true,
    "slaThreshold": 3.0
  }
}
```

**script.js**:
```javascript
// Simple monitors don't use custom scripts
// Configuration is handled entirely in config.json
console.log('Simple monitor configuration loaded');
```

### Example 2: API Endpoint Ping

**Directory**: `monitors/simple-browser/api-ping/`

**config.json**:
```json
{
  "name": "API Endpoint Ping",
  "type": "SIMPLE",
  "frequency": 5,
  "uri": "https://api.example.com/status",
  "locations": ["AWS_US_EAST_1"],
  "status": "ENABLED",
  "options": {
    "validationString": "ok",
    "verifySSL": true,
    "slaThreshold": 2.0
  }
}
```

**script.js**:
```javascript
// Simple monitors don't use custom scripts
console.log('Simple monitor configuration loaded');
```

---

## Advanced Patterns

### Using Secure Credentials

For sensitive data like API keys, passwords, or tokens:

1. Add credentials in New Relic UI (Synthetic Monitoring → Secure credentials)
2. Reference them in scripts using `$secure.CREDENTIAL_NAME`

```javascript
// In your script.js
$http.get('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer ' + $secure.API_TOKEN,
    'X-API-Key': $secure.API_KEY
  }
}, function(err, response, body) {
  // ... your test logic
});
```

### Error Handling

Always include proper error handling:

```javascript
var assert = require('assert');

$http.get('https://api.example.com/endpoint', function(err, response, body) {
  // Check for network errors
  if (err) {
    console.error('Network error occurred: ' + err);
    assert.ok(false, 'Request failed: ' + err);
    return;
  }
  
  // Check status code
  if (response.statusCode !== 200) {
    console.error('Unexpected status code: ' + response.statusCode);
    console.error('Response body: ' + body);
    assert.equal(response.statusCode, 200, 'Expected 200 status');
    return;
  }
  
  // Try to parse JSON
  try {
    var data = JSON.parse(body);
    // ... validation logic
  } catch (parseError) {
    console.error('Failed to parse JSON response');
    console.error('Response body: ' + body);
    assert.ok(false, 'Invalid JSON response');
  }
});
```

### Performance Monitoring

Log timing information for performance tracking:

```javascript
var startTime = Date.now();

$http.get('https://api.example.com/data', function(err, response, body) {
  var endTime = Date.now();
  var duration = endTime - startTime;
  
  console.log('Request duration: ' + duration + 'ms');
  console.log('DNS lookup: ' + response.timingPhases.dns + 'ms');
  console.log('TCP connection: ' + response.timingPhases.tcp + 'ms');
  console.log('TLS handshake: ' + response.timingPhases.ssl + 'ms');
  console.log('Time to first byte: ' + response.timingPhases.firstByte + 'ms');
  console.log('Content download: ' + response.timingPhases.download + 'ms');
  
  // Assert on performance
  assert.ok(duration < 5000, 'Request should complete within 5 seconds');
});
```

### Conditional Logic

Implement conditional checks based on environment or data:

```javascript
$http.get('https://api.example.com/config', function(err, response, body) {
  assert.ok(!err, 'Request error: ' + err);
  
  var config = JSON.parse(body);
  
  // Conditional check based on environment
  if (config.environment === 'production') {
    assert.equal(config.debugMode, false, 'Debug mode should be disabled in production');
    assert.ok(config.ssl, 'SSL should be enabled in production');
  }
  
  // Check different thresholds based on tier
  if (config.tier === 'premium') {
    assert.ok(config.maxUsers >= 1000, 'Premium tier should support 1000+ users');
  }
  
  console.log('✓ Conditional checks passed');
});
```

---

## Tips and Best Practices

1. **Keep monitors focused**: Each monitor should test one specific flow or endpoint
2. **Use descriptive names**: Make it clear what each monitor is testing
3. **Set appropriate frequencies**: Balance monitoring coverage with resource usage
4. **Use multiple locations**: Test from different geographic regions
5. **Add validation strings**: For simple monitors, use validation strings to catch broken pages
6. **Log important info**: Use console.log() to aid debugging
7. **Handle errors gracefully**: Always check for errors and log useful information
8. **Set realistic SLA thresholds**: Base them on your application's actual performance
9. **Use secure credentials**: Never hardcode sensitive data in scripts
10. **Test locally first**: Run monitors manually before deploying

---

For more information, see:
- [New Relic Synthetics Documentation](https://docs.newrelic.com/docs/synthetics/)
- [Scripted Browser Reference](https://docs.newrelic.com/docs/synthetics/synthetic-monitoring/scripting-monitors/synthetic-scripted-browser-reference-monitor-versions-chrome-100/)
- [Scripted API Reference](https://docs.newrelic.com/docs/synthetics/synthetic-monitoring/scripting-monitors/write-synthetic-api-tests/)
