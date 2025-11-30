describe('LoginPageComponent (e2e testing)', () => {
  beforeEach(() => {
    cy.visit('/admin/login');
  });

  it('should show invalid credentials error message', () => {

    cy.intercept('POST', '**/api/Auth/Login').as('loginRequest');

    cy.get('[data-cy="username-input"]').type('testuser');
    cy.get('[data-cy="password-input"]').type('InvalidPassword');
    cy.get('[data-cy="login-button"]').click();

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 401);

    cy.get('[data-cy="error-message"]').should('be.visible').and('contain', 'Invalid username or password');
  });

  it('should enter to the panel with correct credentials', () => {

    const username = Cypress.env('adminUsername');
    const password = Cypress.env('adminPassword');

    cy.get('[data-cy="username-input"]').type(username);

    cy.get('[data-cy="password-input"]').type(password);

    cy.get('[data-cy="login-button"]').click();

    cy.url().should('include', '/dashboard');

    cy.get('p').should('contain', 'dashboard-page works!');
  });

});

