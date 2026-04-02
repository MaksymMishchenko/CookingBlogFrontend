describe('LoginPageComponent (e2e testing)', () => {
  beforeEach(() => {
    cy.visit('/admin/login');
  });

  // it('should show invalid credentials error message', () => {

  //   cy.intercept('POST', '**/api/auth/login').as('loginRequest');

  //   cy.get('[data-cy="username-input"]').type('testuser');
  //   cy.get('[data-cy="password-input"]').type('InvalidPassword');
  //   cy.get('[data-cy="login-button"]').click();

  //   cy.wait('@loginRequest').its('response.statusCode').should('eq', 401);

  //   cy.get('[data-cy="error-message"]').should('be.visible').and('contain', 'Invalid username or password');
  // });

  // it('should clear inline error message when user starts typing after failed login', () => {
  //   cy.intercept('POST', '**/api/auth/login', {
  //     statusCode: 401,
  //     body: { message: 'Invalid credentials' }
  //   }).as('loginRequest');

  //   cy.get('[data-cy="username-input"]').type('wronguser');
  //   cy.get('[data-cy="password-input"]').type('wrongpass');
  //   cy.get('[data-cy="login-button"]').click();

  //   cy.wait('@loginRequest');

  //   cy.get('[data-cy="error-message"]')
  //     .should('be.visible')
  //     .and('contain', 'Invalid credentials');

  //   cy.get('[data-cy="username-input"]')
  //     .clear()
  //     .type('newusername');

  //   cy.get('[data-cy="error-message"]').should('not.exist');
  // });

  it('should enter to the panel with correct credentials', () => {

    const username = Cypress.env('adminUsername');
    const password = Cypress.env('adminPassword');

    cy.get('[data-cy="username-input"]').type(username);

    cy.get('[data-cy="password-input"]').type(password);

    cy.get('[data-cy="login-button"]').click();

    cy.url().should('include', '/dashboard');

    cy.get('p').should('contain', 'dashboard-page works!');
  });

  it('should enter to the panel with mocked credentials', () => {    
    const fakePayload = btoa(JSON.stringify({
      exp: 4070908800,
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '123'
    }));
    const validFakeToken = `header.${fakePayload}.signature`;
    
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: validFakeToken,
          userName: 'admin'
        }
      }
    }).as('loginRequest');
    
    cy.visit('/admin/login');
    cy.get('[data-cy="username-input"]').type('any-user');
    cy.get('[data-cy="password-input"]').type('any-password');
    cy.get('[data-cy="login-button"]').click();
   
    cy.wait('@loginRequest');
    
    cy.url().should('include', '/admin/dashboard');
    cy.get('p').should('contain', 'dashboard-page works!');
  });

});

