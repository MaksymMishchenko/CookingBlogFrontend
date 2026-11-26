import { ADMIN_ROUTER_PATHS, API_ENDPOINTS } from "../../../src/app/core/constants/api-endpoints";

describe('LoginPageComponent (e2e testing)', () => {
  it('should enter to the panel with mocked credentials', () => {

    cy.intercept('GET', `**/${API_ENDPOINTS.ADMIN_POSTS}**`, {
      fixture: 'posts/admin-posts.json'
    }).as('getAdminPosts');

    cy.loginAsAdmin();

    cy.url().should('include', `/${ADMIN_ROUTER_PATHS.DASHBOARD}`);
    cy.wait('@getAdminPosts');
    cy.get('table').should('be.visible');
  });
});

