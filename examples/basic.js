/**
 * Example usage of googlesearch-js
 */
const { search } = require('googlesearch-js');

// Basic usage example
async function basicExample() {
    console.log('Basic search example (URLs only):');

    try {
        let count = 0;
        for await (const url of search('javascript tutorials', { numResults: 5 })) {
            console.log(`${++count}. ${url}`);
        }
    } catch (error) {
        console.error('Search error:', error.message);
    }
}

// Advanced usage example
async function advancedExample() {
    console.log('\nAdvanced search example (with titles and descriptions):');

    try {
        let count = 0;
        for await (const result of search('javascript tutorials', {
            numResults: 3,
            advanced: true
        })) {
            console.log(`\n${++count}. ${result.title}`);
            console.log(`   URL: ${result.url}`);
            console.log(`   Description: ${result.description}`);
        }
    } catch (error) {
        console.error('Search error:', error.message);
    }
}

// Custom options example
async function customOptionsExample() {
    console.log('\nCustom options example:');

    try {
        const options = {
            numResults: 3,
            lang: 'fr',
            advanced: true,
            sleepInterval: 1,
            unique: true,
            region: 'fr'
        };

        for await (const result of search('tutoriels javascript', options)) {
            console.log(`\n${result.title}`);
            console.log(`URL: ${result.url}`);
        }
    } catch (error) {
        console.error('Search error:', error.message);
    }
}

// Run all examples
async function runAllExamples() {
    await basicExample();
    await advancedExample();
    await customOptionsExample();
}

runAllExamples().catch(console.error);