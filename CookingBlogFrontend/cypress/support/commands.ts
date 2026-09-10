declare namespace Cypress {
    interface Chainable {
        loginAsAdmin(): Chainable<void>
    }
}

Cypress.Commands.add('loginAsAdmin', () => {
    const fakePayload = btoa(JSON.stringify({
        exp: 4070908800,
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Admin',
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
    cy.get('[data-cy="username-input"]').type('admin');
    cy.get('[data-cy="password-input"]').type('password');
    cy.get('[data-cy="login-button"]').click();
    cy.wait('@loginRequest');
});