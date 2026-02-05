/**
 * Scripted API Monitor Template
 * 
 * Replace the URL and validation logic with your actual API endpoint and checks.
 */

var assert = require('assert');

// Make your API request
$http.get('https://your-api-endpoint.com/path', function(err, response, body) {
  // Check for network errors
  assert.ok(!err, 'Network error: ' + err);
  
  // Check status code
  assert.equal(response.statusCode, 200, 'Expected status code 200, got ' + response.statusCode);
  
  // Log response time
  console.log('Response time: ' + response.timingPhases.total + 'ms');
  
  // Parse and validate response
  var data = JSON.parse(body);
  
  // Add your validation logic here
  // Examples:
  // assert.ok(data.status, 'Response should contain status field');
  // assert.equal(data.status, 'success', 'Status should be success');
  
  console.log('✓ Monitor check completed successfully');
});
