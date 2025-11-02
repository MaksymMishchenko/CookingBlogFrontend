# CookingBlog Frontend

## Project Overview

This repository contains the frontend for the CookingBlog project, built with Angular. The frontend interacts with the backend, written in C#, through a RESTful API.

The backend repository can be found here: [CookingBlog Backend](https://github.com/MaksymMishchenko/CookingBlogBackend)

Make sure to configure the frontend to connect to the backend API by specifying the correct API endpoints in the configuration files.

## Description

CookingBlog is a culinary blog where users can share recipes and cooking experiences. The project supports functionality for creating, editing, and deleting posts, as well as displaying a list of posts on the frontend, which interacts with a C#-built API.

## Technologies

- **Angular** (version 18) **(Utilizes Standalone Components architecture)**
- **RxJS** for asynchronous data stream handling
- **HTTP Client** for interacting with the API
- **Sass (SCSS)** for styling
- **Cypress** (v13.17.0, for End-to-End testing)
- **Karma & Jasmine** (for Unit testing)

## Prerequisites 

Before proceeding, ensure you have the following installed:

* **Node.js** (v18.x or later recommended)
* **Angular CLI** (Install globally via `npm install -g @angular/cli`)


## Setting Up the Project

### Step 1: Clone the Repository

Clone the repository to your local machine:

`git clone https://github.com/MaksymMishchenko/CookingBlogFrontend.git`

### Step 2: Install Dependencies

Navigate to the project directory and install the necessary dependencies:

```
cd cooking-blog-frontend
npm install
```

### Step 3: Configure the API
Open the file src/environments/environment.ts and set the URL of your backend API:
```
export const environment = {
  production: false,
  apiUrl: 'https://your-backend-api-url/api' // Replace with your actual API URL
};
```

### Step 4: Configure Cypress Base URL
Ensure the Cypress configuration file (cypress.config.ts) is set up to point to the local server URL defined in Step 6:

```
// cypress.config.ts (Snippet)
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // ...
    baseUrl: "http://localhost:4200", // 👈 Check that this URL matches your ng serve address
    // ...
  },
  // ...
});
```

### Step 5: Configure E2E Credentials (Cypress)
Before running end-to-end tests, you must configure a test user for Cypress authentication.

💡 Attention: Since the registration functionality is not yet implemented, testing must be conducted using the credentials of a seeded user that already exists in the backend database.

Create cypress.env.json: Create a file named cypress.env.json in the root directory of the project.

Add Credentials: Enter the login and password of the test user you have seeded on the backend.

🔒 Caution: This file is listed in .gitignore and must not be committed to the repository, as it contains private credentials.

Example cypress.env.json structure (use your seeded user data):

JSON
```
{
  "adminUsername": "admin",
  "adminPassword": "-Rtyuehe1" 
}
```
y
### Step 6: Run the Local Server
To run the project locally, use the following command:

`ng serve`

Visit http://localhost:4200 to see the application in action.

```
Project Structure

/src
  /app
    /admin             # Feature: All administration-related pages (Login, Dashboard, Create/Edit Posts).
      /shared          # Shared components specific to the admin area (e.g., admin-layout).
    /core              # Application-wide, singleton services (e.g., Auth Service, Interceptors).
    /shared            # Reusable components, pipes, and directives used across public and admin areas.
    /home-page         # Feature: Main public landing page.
    /post-page         # Feature: Page for viewing individual posts.
    
    app.config.ts      # Main application configuration.
    app.routes.ts      # Primary routing file (entry point for standalone routing).
    styles.scss        # Main global stylesheet.
```
## Main Commands
- Start the local server: ng serve
- Generate a new component: ng generate component component-name
- Generate a new service: ng generate service service-name
- Create a production build, run the following command: ng build --prod

### Running Tests
To run unit tests, use the following command:

`ng test`

### End-to-End (e2e) Testing with Cypress:
This project uses Cypress for E2E testing. You can run tests in two ways using NPM scripts defined in package.json:

* **Headless (for CI/CD or full run):** To run all tests in the console:
    `npm run cypress:run`
* **Interactive UI (for development):** To open the Cypress Test Runner for development and debugging:
    `npm run cypress:open`

### API Description
Interaction with the backend is done via HTTP requests to the following endpoints:
```
GET /posts — Get a list of all posts.
GET /posts/{id} — Get a specific post by its ID.
POST /posts — Create a new post.
PUT /posts/{id} — Update a post by its ID.
DELETE /posts/{id} — Delete a post by its ID.
```

## To-Do
- Implement a post service that interacts with the backend API.
- Implement comment functionality, allowing users to register and add comments to posts.
- Increase test coverage to ensure reliability.

## Contact
- Author: [Maksym Mishchenko](https://github.com/MaksymMishchenko)
- Email: [mischenkomv@hotmail.com](mailto:mischenkomv@hotmail.com)
- GitHub: [MaksymMishchenko](https://github.com/MaksymMishchenko)