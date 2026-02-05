/**
 * Example Scripted API Monitor
 * 
 * This is a simple example that checks an API endpoint
 * and verifies the response status and content.
 */

var assert = require('assert');

// Make API request
$http.get('https://jsonplaceholder.typicode.com/posts/1', function(err, response, body) {
  // Check for errors
  assert.ok(!err, 'Error making request: ' + err);
  
  // Log response
  console.log('Response status code:', response.statusCode);
  console.log('Response time:', response.timingPhases.total + 'ms');
  
  // Assert status code
  assert.equal(response.statusCode, 200, 'Expected status code 200');
  
  // Parse and validate response body
  var data = JSON.parse(body);
  console.log('Response body userId:', data.userId);
  console.log('Response body title:', data.title);
  
  // Assert response contains expected fields
  assert.ok(data.userId, 'Response should contain userId');
  assert.ok(data.id, 'Response should contain id');
  assert.ok(data.title, 'Response should contain title');
  assert.ok(data.body, 'Response should contain body');
  
  console.log('✓ API check completed successfully');
});
