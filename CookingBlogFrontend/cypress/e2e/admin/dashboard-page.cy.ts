import { API_ENDPOINTS } from "../../../src/app/core/constants/api-endpoints";

describe('Admin Dashboard - Posts List (e2e testing)', () => {
  beforeEach(() => {    
    cy.intercept('GET', '**/api/' + API_ENDPOINTS.USER.AUTHORS + '**', {
      fixture: 'posts/authors.json'
    }).as('getAuthors');

    cy.intercept('GET', '**/api/' + API_ENDPOINTS.ADMIN_POSTS + '**', {
      fixture: 'posts/admin-posts.json'
    }).as('getAdminPosts');
  });

  it('should successfully login and display posts from backend', () => {
    cy.loginAsAdmin();
    cy.wait(['@getAdminPosts', '@getAuthors']);

    cy.get('tbody tr').should('have.length', 2);
    cy.get('tbody tr').first().within(() => {
      cy.get('td').eq(0).should('contain', 'Non dolor exercitationem.');
      cy.get('.edit-btn').should('be.visible');
      cy.get('.delete-btn').should('be.visible').and('contain', 'Delete');
    });
  });
});