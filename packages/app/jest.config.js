// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
// https://kulshekhar.github.io/ts-jest/user/config/

const MODULE_NAME_MAPPING = {
  '^\\^/(.+)$': '<rootDir>/$1',
  '^~/(.+)$': '<rootDir>/src/$1',
  '^@growi/([^/]+)$': '<rootDir>/../$1/src',
  '^@growi/([^/]+)/(.+)$': '<rootDir>/../$1/src/$2',
};

module.exports = {
  // Indicates whether each individual test should be reported during the run
  verbose: true,

  preset: 'ts-jest/presets/js-with-ts',

  projects: [
    {
      displayName: 'unit',

      preset: 'ts-jest/presets/js-with-ts',

      // transform ESM to CJS
      transformIgnorePatterns: [
        '/node_modules/(?!remark-gfm)/',
      ],

      rootDir: '.',
      roots: ['<rootDir>'],
      testMatch: ['<rootDir>/test/unit/**/*.test.ts', '<rootDir>/test/unit/**/*.test.js'],

      testEnvironment: 'node',

      // Automatically clear mock calls and instances between every test
      clearMocks: true,
      moduleNameMapper: MODULE_NAME_MAPPING,

    },
    {
      displayName: 'server',

      preset: 'ts-jest/presets/js-with-ts',

      rootDir: '.',
      roots: ['<rootDir>'],
      testMatch: ['<rootDir>/test/integration/**/*.test.ts', '<rootDir>/test/integration/**/*.test.js'],
      // https://regex101.com/r/jTaxYS/1
      modulePathIgnorePatterns: ['<rootDir>/test/integration/*.*/v5(..*)*.[t|j]s'],
      testEnvironment: 'node',
      globalSetup: '<rootDir>/test/integration/global-setup.js',
      globalTeardown: '<rootDir>/test/integration/global-teardown.js',
      setupFilesAfterEnv: ['<rootDir>/test/integration/setup.js'],

      // Automatically clear mock calls and instances between every test
      clearMocks: true,
      moduleNameMapper: MODULE_NAME_MAPPING,
    },
    {
      displayName: 'server-v5',

      preset: 'ts-jest/presets/js-with-ts',

      rootDir: '.',
      roots: ['<rootDir>'],
      testMatch: ['<rootDir>/test/integration/**/v5.*.test.ts', '<rootDir>/test/integration/**/v5.*.test.js'],

      testEnvironment: 'node',
      globalSetup: '<rootDir>/test/integration/global-setup.js',
      globalTeardown: '<rootDir>/test/integration/global-teardown.js',
      setupFilesAfterEnv: ['<rootDir>/test/integration/setup.js'],

      // Automatically clear mock calls and instances between every test
      clearMocks: true,
      moduleNameMapper: MODULE_NAME_MAPPING,
    },
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
