import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'test/cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'test/cypress/support/index.ts',
    setupNodeEvents: (on) => {
      // change screen size
      // see: https://docs.cypress.io/api/plugins/browser-launch-api#Set-screen-size-when-running-headless
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chromium' && browser.isHeadless) {
          launchOptions.args.push('--window-size=1400,1024');
          launchOptions.args.push('--force-device-scale-factor=1');
        }
        return launchOptions;
      });
    },
    defaultCommandTimeout: 7000,
  },
  fileServerFolder: 'test/cypress',
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',

  viewportWidth: 1400,
  viewportHeight: 1024,

});
