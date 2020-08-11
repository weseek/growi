// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
// https://kulshekhar.github.io/ts-jest/user/config/

const MODULE_NAME_MAPPING = {
  '^\\^/(.+)$': '<rootDir>/$1',
  '^~/(.+)$': '<rootDir>/src/$1',
  '^@alias/logger$': '<rootDir>/src/utils/logger',
};

module.exports = {
  // Indicates whether each individual test should be reported during the run
  verbose: true,

  preset: 'ts-jest/presets/js-with-ts',

  rootDir: '../',
  roots: ['<rootDir>/src'],

  projects: [
    {
      displayName: 'server',

      preset: 'ts-jest/presets/js-with-ts',

      rootDir: '.',
      roots: ['<rootDir>/src'],
      testEnvironment: 'node',
      globalSetup: '<rootDir>/src/test/global-setup.js',
      globalTeardown: '<rootDir>/src/test/global-teardown.js',
      setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
      testMatch: ['<rootDir>/src/test/**/*.test.ts', '<rootDir>/src/test/**/*.test.js'],
      // Automatically clear mock calls and instances between every test
      clearMocks: true,
      moduleNameMapper: MODULE_NAME_MAPPING,

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
