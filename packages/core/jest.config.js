// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const MODULE_NAME_MAPPING = {
  '^~/(.+)$': '<rootDir>/src/$1',
};

module.exports = {

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '@swc/jest',
  },
  transformIgnorePatterns: [],

  moduleNameMapper: MODULE_NAME_MAPPING,

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
    '/node_modules/',
  ],

  // An object that configures minimum threshold enforcement for coverage results
  // TODO: activate -- 2020.03.24 Yuki Takei
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70,
  //   },
  // },

  // An array of file extensions your modules use
  moduleFileExtensions: [
    'js',
    'json',
    'jsx',
    'ts',
    'tsx',
    'node',
  ],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/test/**/__tests__/**/*.[jt]s?(x)',
    '**/test/**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};
