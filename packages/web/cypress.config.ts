import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: true,
    screenshotOnRunFailure: true,
    env: {
      /** Express API base URL */
      apiUrl: 'http://localhost:3000/api',
    },
    setupNodeEvents(_on, _config) {
      // Node event listeners can be added here
    },
  },
});
