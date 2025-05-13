/**
 * googlesearch-js
 * A JavaScript library for searching Google, easily
 */

const { search } = require('./search');
const { SearchResult } = require('./models');
const { getUserAgent } = require('./user-agents');

module.exports = {
    search,
    SearchResult,
    getUserAgent,
};