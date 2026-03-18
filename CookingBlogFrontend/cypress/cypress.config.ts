// import { defineConfig } from "cypress";

// export default defineConfig({
//   e2e: {
//     specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
//     baseUrl: "http://localhost:4200",
//     setupNodeEvents(on, config) {      
//       const env = require('./env/cypress.env.json');
//       config.env = { ...config.env, ...env };
//       return config;
//     },
//   },

//   component: {
//     devServer: {
//       framework: "angular",
//       bundler: "webpack",
//     },
//     specPattern: "cypress/components/**/*.cy.ts",
//   },
// });

import { defineConfig } from "cypress";
import * as fs from 'fs';
import * as path from 'path';

export default defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:4200",
    setupNodeEvents(on, config) {
      try {
        // Використовуємо path.resolve з __dirname для надійності
        // Перевір шлях: якщо env лежить в папочці cypress, то додаємо її
        const envPath = path.resolve(__dirname, './cypress/env/cypress.env.json');

        if (fs.existsSync(envPath)) {
          // Для динамічного завантаження в TS можна залишити require 
          // або використати readFileSync
          const envData = fs.readFileSync(envPath, 'utf-8');
          const env = JSON.parse(envData);
          
          config.env = { ...config.env, ...env };
          console.log('Successfully loaded cypress.env.json');
        } else {
          console.warn('cypress.env.json not found, using default environment');
        }
      } catch (error) {
        console.error('Error loading cypress.env.json:', error);
      }
      return config;
    },
  },
  // ... решта коду (component і т.д.)
});
