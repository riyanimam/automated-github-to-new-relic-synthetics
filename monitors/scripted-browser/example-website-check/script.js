/**
 * Example Scripted Browser Monitor
 * 
 * This is a simple example that checks a website homepage
 * and verifies the title contains expected text.
 */

// Visit the website
$browser.get('https://example.com');

// Wait for the page to load
$browser.wait(function() {
  return $browser.isElementPresent($driver.By.tagName('h1'));
}, 10000, 'Timeout waiting for page to load');

// Get the page title
$browser.getTitle().then(function(title) {
  console.log('Page title is: ' + title);
  
  // Assert that title contains expected text
  if (title.indexOf('Example') === -1) {
    throw new Error('Page title does not contain "Example"');
  }
});

// Log success
console.log('✓ Website check completed successfully');
