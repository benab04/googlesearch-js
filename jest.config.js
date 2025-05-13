module.exports = {
    transform: {}, // Use default transformers
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json'],
    testMatch: ['**/test/**/*.js'],
    collectCoverage: true,
    coverageDirectory: './coverage',
    coveragePathIgnorePatterns: ['/node_modules/'],
    // Fixes for the regular expression issues
    transformIgnorePatterns: ['/node_modules/'],
    testPathIgnorePatterns: ['/node_modules/']
};