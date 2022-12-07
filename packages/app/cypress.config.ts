import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'test/cypress/integration/**/*.spec.ts',
    supportFile: 'test/cypress/support/index.ts',
  },
  fileServerFolder: 'test/cypress',
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',

  viewportWidth: 1400,
  viewportHeight: 1024,

  defaultCommandTimeout: 30000,
});
