describe('Admin Dashboard - Posts List (e2e testing)', () => {
  beforeEach(() => {    
    cy.intercept('GET', '**/auth/authors**', {
      fixture: 'posts/authors.json'
    }).as('getAuthors');

    cy.intercept('GET', '**/admin/posts**', {
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

  it('should sort posts by title when clicking on table header', () => {
    cy.loginAsAdmin();
    cy.wait(['@getAdminPosts', '@getAuthors']);

    cy.get('.sortable-header').contains('Title').click();

    cy.wait('@getAdminPosts').then((interception) => {
      const url = interception.request.url;
      expect(url).to.include('sortBy=title');
      expect(url).to.include('sortDirection=asc');
    });
  });

  it('should sort posts by date when clicking on date table header', () => {
    cy.loginAsAdmin();
    cy.wait(['@getAdminPosts', '@getAuthors']);

    cy.get('.sortable-header').contains('Date').click();

    cy.wait('@getAdminPosts').then((interception) => {
      const url = interception.request.url;
      expect(url).to.include('sortBy=createdAt');
      expect(url).to.include('sortDirection=asc');
    });
  });

  it('should filter posts by author when selecting an author from dropdown', () => {
    cy.loginAsAdmin();
    cy.wait(['@getAdminPosts', '@getAuthors']);

    cy.get('.filters-row select')
      .filter(':has(option:contains("All Authors"))')
      .should('be.visible')
      .select('31eae5f5-6582-40ec-a04a-eb38e1a68c5c');

    cy.wait('@getAdminPosts').then((interception) => {
      const url = interception.request.url;
      expect(url).to.include('authorId=31eae5f5-6582-40ec-a04a-eb38e1a68c5c');
    });
  });
});