import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:4200",
    setupNodeEvents(on, config) {      
      const env = require('./env/cypress.env.json');
      config.env = { ...config.env, ...env };
      return config;
    },
  },

  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "cypress/components/**/*.cy.ts",
  },
});
