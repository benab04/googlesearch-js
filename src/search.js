/**
 * Google search implementation
 */
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { SearchResult } = require('./models');
const { getUserAgent } = require('./user-agents');

/**
 * Make a request to Google search
 * @private
 * @param {string} term - Search term
 * @param {number} results - Number of results to fetch
 * @param {string} lang - Language code
 * @param {number} start - Start index
 * @param {Object|null} proxies - Proxy configuration
 * @param {number} timeout - Timeout in seconds
 * @param {string} safe - Safe search setting
 * @param {boolean} sslVerify - Whether to verify SSL certificates
 * @param {string|null} region - Region code
 * @returns {Promise<string>} HTML response text
 */
async function _req(term, results, lang, start, proxies, timeout, safe, sslVerify, region) {
    const params = new URLSearchParams({
        q: term,
        num: results + 2, // Prevents multiple requests
        hl: lang,
        start: start,
        safe: safe,
    });

    if (region) {
        params.set('gl', region);
    }

    const headers = {
        'User-Agent': getUserAgent(),
        'Accept': '*/*',
        'Cookie': 'CONSENT=PENDING+987; SOCS=CAESHAgBEhIaAB' // Bypasses the consent page
    };

    const options = {
        method: 'GET',
        headers: headers,
        timeout: timeout * 1000,
        agent: proxies,
        // Node.js specific option
        strictSSL: sslVerify
    };

    const response = await fetch(`https://www.google.com/search?${params.toString()}`, options);

    if (!response.ok) {
        throw new Error(`Google search request failed with status ${response.status}`);
    }

    return response.text();
}

/**
 * Search the Google search engine
 * @param {string} term - Search term
 * @param {Object} options - Search options
 * @param {number} [options.numResults=10] - Number of results to return
 * @param {string} [options.lang="en"] - Language code
 * @param {string|null} [options.proxy=null] - Proxy URL
 * @param {boolean} [options.advanced=false] - Whether to return advanced results
 * @param {number} [options.sleepInterval=0] - Sleep interval between requests in seconds
 * @param {number} [options.timeout=5] - Request timeout in seconds
 * @param {string} [options.safe="active"] - Safe search setting
 * @param {boolean} [options.sslVerify=true] - Whether to verify SSL certificates
 * @param {string|null} [options.region=null] - Region code
 * @param {number} [options.startNum=0] - Start index
 * @param {boolean} [options.unique=false] - Whether to return unique results
 * @returns {AsyncGenerator<string|SearchResult>}
 */
async function* search(term, {
    numResults = 10,
    lang = "en",
    proxy = null,
    advanced = false,
    sleepInterval = 0,
    timeout = 5,
    safe = "active",
    sslVerify = true,
    region = null,
    startNum = 0,
    unique = false
} = {}) {
    // Proxy setup for Node.js
    let proxies = null;
    if (proxy && (proxy.startsWith("https") || proxy.startsWith("http") || proxy.startsWith("socks5"))) {
        // In a real implementation, you would use an HTTP/HTTPS agent with the proxy configuration
        // This is simplified for the example
        proxies = proxy;
    }

    let start = startNum;
    let fetchedResults = 0;
    let fetchedLinks = new Set();

    while (fetchedResults < numResults) {
        // Send request
        const responseText = await _req(
            term,
            numResults - fetchedResults,
            lang,
            start,
            proxies,
            timeout,
            safe,
            sslVerify,
            region
        );

        // Parse response with JSDOM
        const { document } = new JSDOM(responseText).window;
        const resultBlocks = document.querySelectorAll("div.ezO2md");

        let newResults = 0;

        for (const result of resultBlocks) {
            // Find the link tag within the result block
            const linkTag = result.querySelector("a[href]");
            // Find the title tag within the link tag
            const titleTag = linkTag ? linkTag.querySelector("span.CVA68e") : null;
            // Find the description tag within the result block
            const descriptionTag = result.querySelector("span.FrIlee");

            // Check if all necessary tags are found
            if (linkTag && titleTag && descriptionTag) {
                // Extract and decode the link URL
                const href = linkTag.getAttribute("href");
                const link = decodeURIComponent(href.split("&")[0].replace("/url?q=", ""));

                // Check if the link has already been fetched and if unique results are required
                if (fetchedLinks.has(link) && unique) {
                    continue; // Skip this result if the link is not unique
                }

                // Add the link to the set of fetched links
                fetchedLinks.add(link);

                // Extract the title text
                const title = titleTag ? titleTag.textContent : "";

                // Extract the description text
                const description = descriptionTag ? descriptionTag.textContent : "";

                // Increment the count of fetched results
                fetchedResults++;

                // Increment the count of new results in this iteration
                newResults++;

                // Yield the result based on the advanced flag
                if (advanced) {
                    yield new SearchResult(link, title, description); // Yield a SearchResult object
                } else {
                    yield link; // Yield only the link
                }

                if (fetchedResults >= numResults) {
                    break; // Stop if we have fetched the desired number of results
                }
            }
        }

        if (newResults === 0) {
            break; // Break the loop if no new results were found in this iteration
        }

        start += 10; // Prepare for the next set of results

        if (sleepInterval > 0) {
            await new Promise(resolve => setTimeout(resolve, sleepInterval * 1000));
        }
    }
}

module.exports = { search };