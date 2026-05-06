import { defineConfig } from "cypress";
import * as fs from 'fs';
import * as path from 'path';

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",
    specPattern: "cypress/e2e/**/*.cy.ts",
    setupNodeEvents(on, config) {
      try {
        const envPath = path.resolve(__dirname, './cypress/env/cypress.env.json');
        if (fs.existsSync(envPath)) {
          const envData = fs.readFileSync(envPath, 'utf-8');
          config.env = { ...config.env, ...JSON.parse(envData) };
          console.log('Successfully loaded cypress.env.json');
        }
      } catch (error) {
        console.error('Error in setupNodeEvents:', error);
      }
      return config;
    },
  },

  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
      options: {
        projectConfig: {
          root: "",
          sourceRoot: "src",
          buildOptions: {
            tsConfig: "tsconfig.app.json",
            main: "src/main.ts",
            assets: [{ glob: "**/*", input: "public", output: "/" }],
            styles: ["src/styles.scss"],
            stylePreprocessorOptions: { includePaths: ["src/styles"] },
          },
        },
      } as any,
    },
    specPattern: "cypress/components/**/*.cy.ts",
  },
});