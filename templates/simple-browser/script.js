/**
 * Simple Browser Monitor Template
 * 
 * Note: Simple browser monitors don't use custom scripts.
 * All configuration is done in config.json:
 * 
 * - uri: The URL to check
 * - validationString: Optional text to find on the page
 * - verifySSL: Whether to verify SSL certificate
 * - frequency: How often to check (in minutes)
 * - locations: Where to check from
 * 
 * The monitor will:
 * 1. Visit the URL
 * 2. Check for HTTP 200 response
 * 3. Verify SSL certificate (if enabled)
 * 4. Search for validation string (if provided)
 * 5. Report response time and availability
 */

console.log('Simple monitor - configuration handled in config.json');
