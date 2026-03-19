# CookingBlog Frontend

# CookingBlog Frontend

CookingBlog is a culinary platform built with **Angular 18 (Standalone Components)**. It allows users to explore, search, and comment on recipes, powered by a .NET C# REST API.

🔗 **Backend Repository:** [CookingBlog Backend](https://github.com/MaksymMishchenko/CookingBlogBackend)

## 🚀 Key Features

- **Live Search**: Real-time recipe search with RxJS debouncing to minimize API calls.
- **Search Page**: Dedicated results page for deep filtering.
- **Comments System**: Interactive user comments for recipes.
- **Responsive Design**: Fully mobile-friendly layout using SCSS and Breakpoint services.
- **Robust Testing**: 
  - Unit tests with Jasmine/Karma for business logic.
  - E2E tests with Cypress for critical user flows (e.g., Navigation, Search).
- **CI/CD Pipeline**: Automated testing and semantic versioning via GitHub Actions.

## 🛠 Tech Stack

- **Framework**: Angular 18 (Standalone architecture)
- **State & Logic**: RxJS, HTTP Client
- **Styles**: SCSS (Responsive design)
- **Testing**: Cypress, Karma, Jasmine

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

- /admin      # Dashboard, Login, and post management (WIP).
- /core       # Singleton services: Auth, Interceptors, Guards.
- /shared     # Reusable UI components, pipes, and directives.
- /home-page  # Main public recipes listing.
- /post-page  # Individual recipe view and comments.
```

## 🤖 CI/CD

This project uses **GitHub Actions** for:
- Automated builds and testing on every Pull Request to `main`.
- **Automatic Releases**: Using Semantic Versioning (SemVer). Every merge to `main` triggers a new version tag and a GitHub Release with build artifacts.

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
- [ ] **Admin Dashboard (WIP)**: Currently only routing skeleton is implemented. Future updates will include:
  - Rich text editor for posts.
  - Image upload management.  
- [ ] Social Media sharing integration.

## Contact
- Author: [Maksym Mishchenko](https://github.com/MaksymMishchenko)
- Email: [mischenkomv@hotmail.com](mailto:mischenkomv@hotmail.com)
- GitHub: [MaksymMishchenko](https://github.com/MaksymMishchenko)