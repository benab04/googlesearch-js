# googlesearch-js

A JavaScript library for searching Google, easily.

## Installation

```bash
npm install googlesearch-js
```

## Usage

### Basic Usage

```javascript
const { search } = require('googlesearch-js');

// Using async/await with for-await-of
async function searchGoogle() {
  // Get just the URLs (default behavior)
  for await (const url of search('javascript tutorials')) {
    console.log(url);
  }
}

searchGoogle();
```

### Advanced Usage

```javascript
const { search } = require('googlesearch-js');

async function searchGoogleAdvanced() {
  // Get full search results with title and description
  for await (const result of search('javascript tutorials', { advanced: true })) {
    console.log(`URL: ${result.url}`);
    console.log(`Title: ${result.title}`);
    console.log(`Description: ${result.description}`);
    console.log('---');
  }
}

searchGoogleAdvanced();
```

### With Options

```javascript
const { search } = require('googlesearch-js');

async function searchWithOptions() {
  const options = {
    numResults: 5,         // Number of results to fetch
    lang: 'fr',            // Language setting (e.g., 'en', 'fr', 'es')
    proxy: null,           // Proxy URL (e.g., 'http://user:pass@host:port')
    advanced: true,        // Return SearchResult objects with title and description
    sleepInterval: 1,      // Sleep 1 second between pagination requests
    timeout: 10,           // Request timeout in seconds
    safe: 'off',           // Safe search setting ('active', 'moderate', 'off')
    sslVerify: true,       // Verify SSL certificates
    region: 'fr',          // Region setting (e.g., 'us', 'uk', 'fr')
    startNum: 0,           // Start index for pagination
    unique: true           // Filter out duplicate results
  };

  for await (const result of search('javascript tutorials', options)) {
    console.log(result.toString());
  }
}

searchWithOptions();
```

### Using with Promise.all

```javascript
const { search } = require('googlesearch-js');

async function searchMultipleTerms() {
  const terms = ['javascript', 'node.js', 'react'];
  const searchPromises = terms.map(async (term) => {
    const results = [];
    for await (const url of search(term, { numResults: 3 })) {
      results.push(url);
    }
    return { term, results };
  });
  
  const allResults = await Promise.all(searchPromises);
  console.log(allResults);
}

searchMultipleTerms();
```

## API

### search(term, options)

Performs a Google search and returns results as an async generator.

**Parameters:**

- `term` (string): The search query term
- `options` (object, optional): Configuration options
  - `numResults` (number): Number of results to return (default: 10)
  - `lang` (string): Language code (default: 'en')
  - `proxy` (string|null): Proxy URL (default: null)
  - `advanced` (boolean): Whether to return advanced results (default: false)
  - `sleepInterval` (number): Sleep interval between requests in seconds (default: 0)
  - `timeout` (number): Request timeout in seconds (default: 5)
  - `safe` (string): Safe search setting ('active', 'moderate', 'off') (default: 'active')
  - `sslVerify` (boolean): Whether to verify SSL certificates (default: true)
  - `region` (string|null): Region code (default: null)
  - `startNum` (number): Start index (default: 0)
  - `unique` (boolean): Whether to return unique results (default: false)

**Returns:**

An async generator that yields either:
- URL strings (if `advanced` is false)
- `SearchResult` objects (if `advanced` is true)

### SearchResult

A class representing a Google search result.

**Properties:**

- `url` (string): URL of the search result
- `title` (string): Title of the search result
- `description` (string): Description of the search result

**Methods:**

- `toString()`: Returns a string representation of the search result

### getUserAgent()

Generates a random user agent string.

**Returns:**

A randomly generated user agent string.

## Disclaimer

This library is for educational purposes only. Please be aware that scraping Google may violate their terms of service. Use responsibly and at your own risk.

## License

MIT