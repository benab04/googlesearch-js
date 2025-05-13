/**
 * Search result model
 */
class SearchResult {
    /**
     * Create a search result
     * @param {string} url - URL of the search result
     * @param {string} title - Title of the search result
     * @param {string} description - Description of the search result
     */
    constructor(url, title, description) {
        this.url = url;
        this.title = title;
        this.description = description;
    }

    /**
     * String representation of the search result
     * @returns {string} String representation
     */
    toString() {
        return `SearchResult(url=${this.url}, title=${this.title}, description=${this.description})`;
    }
}

module.exports = { SearchResult };