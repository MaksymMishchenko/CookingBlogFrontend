describe('Admin Dashboard - Posts List (e2e testing)', () => {
  it('should successfully login and display posts from backend', () => {
    // Arrange  
    cy.intercept('GET', '**/admin/posts**', {
      fixture: 'posts/admin-posts.json'
    }).as('getAdminPosts');

    // Act
    cy.loginAsAdmin();
    cy.wait('@getAdminPosts');

    // Assert
    cy.get('tbody tr').should('have.length', 2);
    cy.get('tbody tr').first().within(() => {
      cy.get('td').eq(0).should('contain', 'Non dolor exercitationem.');
      cy.get('.edit-btn').should('be.visible');
      cy.get('.delete-btn').should('be.visible').and('contain', 'Delete');
    });
  });

  it('should sort posts by title when clicking on table header', () => {
    // Arrange
    cy.intercept('GET', '**/admin/posts**', {
      fixture: 'posts/admin-posts.json'
    }).as('getAdminPosts');

    cy.loginAsAdmin();
    cy.wait('@getAdminPosts');

    // Act
    cy.get('.sortable-header').contains('Title').click();

    // Assert
    cy.get('.sortable-header').should('contain', '▲');
    cy.wait('@getAdminPosts').then((interception) => {
      const url = interception.request.url;
      expect(url).to.include('sortBy=title');
      expect(url).to.include('sortDirection=asc');
    });
  });

  it('should sort posts by date when clicking on date table header', () => {
    // Arrange
    cy.intercept('GET', '**/admin/posts**', {
      fixture: 'posts/admin-posts.json'
    }).as('getAdminPosts');

    cy.loginAsAdmin();
    cy.wait('@getAdminPosts');

    // Act
    cy.get('.sortable-header').contains('Date').click();

    // Assert
    cy.get('.sortable-header').contains('Date').should('contain', '▲');
    cy.wait('@getAdminPosts').then((interception) => {
      const url = interception.request.url;
      expect(url).to.include('sortBy=createdAt');
      expect(url).to.include('sortDirection=asc');
    });
  });
});