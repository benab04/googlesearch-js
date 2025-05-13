/**
 * Google search implementation
 */
const fetch = require('node-fetch');
const cheerio = require('cheerio');
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

        // Parse response with cheerio
        const $ = cheerio.load(responseText);
        const resultBlocks = $("div.ezO2md");

        let newResults = 0;

        resultBlocks.each((index, element) => {
            // If we already have enough results, break early
            if (fetchedResults >= numResults) {
                return false; // break the loop
            }

            // Find the link tag within the result block
            const linkTag = $(element).find("a[href]");
            // Find the title tag within the link tag
            const titleTag = linkTag.find("span.CVA68e");
            // Find the description tag within the result block
            const descriptionTag = $(element).find("span.FrIlee");

            // Check if all necessary tags are found
            if (linkTag.length && titleTag.length && descriptionTag.length) {
                // Extract and decode the link URL
                const href = linkTag.attr("href");
                const link = decodeURIComponent(href.split("&")[0].replace("/url?q=", ""));

                // Check if the link has already been fetched and if unique results are required
                if (fetchedLinks.has(link) && unique) {
                    return true; // continue to next result
                }

                // Add the link to the set of fetched links
                fetchedLinks.add(link);

                // Extract the title text
                const title = titleTag.text();

                // Extract the description text
                const description = descriptionTag.text();

                // Increment the count of fetched results
                fetchedResults++;

                // Increment the count of new results in this iteration
                newResults++;

                // Store the result to yield it later (since we can't yield inside an each() callback)
                if (advanced) {
                    this.yieldValue = new SearchResult(link, title, description);
                } else {
                    this.yieldValue = link;
                }

                // Yield value outside of the loop
                return false; // break the loop after finding a result
            }
        });

        // Yield the stored value if there is one
        if (this.yieldValue) {
            yield this.yieldValue;
            this.yieldValue = null;
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