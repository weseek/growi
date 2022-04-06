// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
// https://kulshekhar.github.io/ts-jest/user/config/

const MODULE_NAME_MAPPING = {
  '^\\^/(.+)$': '<rootDir>/$1',
  '^~/(.+)$': '<rootDir>/src/$1',
  '^@growi/(.+)$': '<rootDir>/../$1/src',
};

module.exports = {
  // Indicates whether each individual test should be reported during the run
  verbose: true,

  preset: 'ts-jest/presets/js-with-ts',

  projects: [
    {
      displayName: 'unit',

      preset: 'ts-jest/presets/js-with-ts',

      rootDir: '.',
      roots: ['<rootDir>/src'],
      testMatch: ['<rootDir>/src/test/unit/**/*.test.ts', '<rootDir>/src/test/unit/**/*.test.js'],

      testEnvironment: 'node',

      // Automatically clear mock calls and instances between every test
      clearMocks: true,
      moduleNameMapper: MODULE_NAME_MAPPING,
    },
    {
      displayName: 'server',

      preset: 'ts-jest/presets/js-with-ts',

      rootDir: '.',
      roots: ['<rootDir>/src'],
      testMatch: ['<rootDir>/src/test/integration/**/*.test.ts', '<rootDir>/src/test/integration/**/*.test.js'],

      testEnvironment: 'node',
      globalSetup: '<rootDir>/src/test/integration/global-setup.js',
      globalTeardown: '<rootDir>/src/test/integration/global-teardown.js',
      setupFilesAfterEnv: ['<rootDir>/src/test/integration/setup.js'],

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

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    'index.ts',
    '/config/',
    '/resource/',
    '/node_modules/',
  ],

};
