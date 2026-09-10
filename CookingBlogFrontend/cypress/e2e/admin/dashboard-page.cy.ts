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
});