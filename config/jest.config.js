// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Indicates whether each individual test should be reported during the run
  verbose: true,

  rootDir: '../',

  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Automatically reset mock state between every test
  resetMocks: true,

  // A map from regular expressions to module names that allow to stub out resources with a single module
  // moduleNameMapper: {},

  projects: [
    {
      displayName: 'server',
      testEnvironment: 'node',
      rootDir: '.',
      setupFilesAfterEnv: ['<rootDir>/src/test/bootstrap.js'],
      testMatch: ['<rootDir>/src/test/**/*.test.js'],
    },
    // {
    //   displayName: 'client',
    //   rootDir: '.',
    //   testMatch: ['<rootDir>/src/test/client/**/*.test.js'],
    // },
  ],


  // Indicates whether the coverage information should be collected while executing the test
  // collectCoverage: false,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/client/**/*.js',
    'src/lib/**/*.js',
    'src/migrations/**/*.js',
    'src/server/**/*.js',
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

};
