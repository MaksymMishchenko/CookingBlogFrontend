describe('Admin Dashboard - Posts List (e2e testing)', () => {
  it('should successfully login and display posts from backend', () => {
        
    cy.intercept('GET', '**/admin/posts**', {
      fixture: 'posts/admin-posts.json'
    }).as('getAdminPosts');
        
    cy.loginAsAdmin();
       
    cy.wait('@getAdminPosts');
    
    cy.get('tbody tr').should('have.length', 2);
    cy.get('tbody tr').first().within(() => {
      cy.get('td').eq(0).should('contain', 'Non dolor exercitationem.');
      cy.get('.edit-btn').should('be.visible');
      cy.get('.delete-btn').should('be.visible').and('contain', 'Delete');
    });
  });

  it('should sort posts by title when clicking on table header', () => {
    cy.intercept('GET', '**/admin/posts**', {
      fixture: 'posts/admin-posts.json'
    }).as('getAdminPosts');
        
    cy.loginAsAdmin();
    cy.wait('@getAdminPosts');

    cy.get('.sortable-header').click();

    cy.get('.sortable-header').should('contain', '▲');

    cy.wait('@getAdminPosts').then((interception) => {
      const url = interception.request.url;
      expect(url).to.include('sortBy=title');
      expect(url).to.include('sortDirection=asc');
    });
  });
});