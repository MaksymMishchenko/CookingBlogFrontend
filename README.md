# CookingBlog Frontend

## Project Overview

This repository contains the frontend for the CookingBlog project, built with Angular. The frontend interacts with the backend, written in C#, through a RESTful API.

The backend repository can be found here: [CookingBlog Backend](https://github.com/MaksymMishchenko/CookingBlogBackend)

Make sure to configure the frontend to connect to the backend API by specifying the correct API endpoints in the configuration files.

## Description

CookingBlog is a culinary blog where users can share recipes and cooking experiences. The project supports functionality for creating, editing, and deleting posts, as well as displaying a list of posts on the frontend, which interacts with a C#-built API.

## Technologies

- **Angular** (version 18)
- **RxJS** for asynchronous data stream handling
- **HTTP Client** for interacting with the API
- **Sass (SCSS)** for styling


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

## Step 4: Run the Local Server
To run the project locally, use the following command:

`ng serve`

Visit http://localhost:4200 to see the application in action.

```
Project Structure

/src
  /app
    /admin
      dashboard-page        
      create-page
      login-page
      edit-page
      shared
        /admin-layout  
      admin.module.ts    
    /home-page
    /post-page
    /shared      
    /app.module.ts
    /app.routes.ts
    /app-routing.module.ts
    styles.scss               # Main styles file
```
## Main Commands
- Start the local server: ng serve
- Generate a new component: ng generate component component-name
- Generate a new service: ng generate service service-name
- Generate a new module: ng generate module module-name

### Running Tests
To run unit tests, use the following command:

`ng test`

### For end-to-end (e2e) tests (if set up), use the command:

`ng e2e`

### API Description
Interaction with the backend is done via HTTP requests to the following endpoints:
```
GET /posts — Get a list of all posts.
GET /posts/{id} — Get a specific post by its ID.
POST /posts — Create a new post.
PUT /posts/{id} — Update a post by its ID.
DELETE /posts/{id} — Delete a post by its ID.
```
## Developer Setup Guide
### Environment Setup:
Make sure you have Node.js and Angular CLI installed. To install Node.js, visit the official website, and to install Angular CLI, run the following command:

`npm install -g @angular/cli`

### API Configuration:
Set the correct backend URL in src/environments/environment.ts.

### Component Development:
Add new components, services, and models to implement the desired functionality of your blog.

### Testing:
Use ng test to run unit tests and ng e2e for integration testing.

### Production Build:
To create a production build, run the following command:

`ng build --prod`

This will place all the deployable files in the dist/ directory.

## To-Do
- Implement an authentication service that interacts with the backend API.
- Implement a post service that interacts with the backend API.
- Implement comment functionality, allowing users to register and add comments to posts.
- Increase test coverage to ensure reliability.

## Contact
- Author: [Maksym Mishchenko](https://github.com/MaksymMishchenko)
- Email: [mischenkomv@hotmail.com](mailto:mischenkomv@hotmail.com)
- GitHub: [MaksymMishchenko](https://github.com/MaksymMishchenko)