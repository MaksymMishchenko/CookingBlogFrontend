describe('Admin Create Post (e2e testing)', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
    });

    it('should successfully create a new post', () => {
        cy.intercept('GET', '**/api/category', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { id: 1, name: 'Main Course' },
                    { id: 2, name: 'Desserts' }
                ]
            }
        }).as('getCategories');

        cy.intercept('GET', '**/admin/posts**', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { id: 10, title: 'New Cypress Test Post', categoryName: 'Main Course', isActive: true }
                ]
            }
        }).as('getPosts');

        cy.intercept('POST', '**/admin/posts', {
            statusCode: 201,
            body: { success: true, data: { id: 10 } }
        }).as('createPostRequest');

        cy.visit('/admin/create');

        cy.wait('@getCategories');

        cy.get('[data-cy="title-input"]').type('New Cypress Test Post');
        cy.get('[data-cy="description-input"]').type('This is a test description for the recipe.');
        cy.get('[data-cy="content-input"] .ql-editor').type('This is a long enough content body for the test post that satisfies requirements...');        
        cy.get('[data-cy="imageUrl-input"]').type('https://example.com/image.jpg');
        cy.get('[data-cy="slug-input"]').type('new-cypress-test-post');
        cy.get('[data-cy="categoryId-select"]').select('Main Course');
        cy.get('[data-cy="isActive-select"]').select(1);

        cy.get('[data-cy="submit-btn"]').click();

        cy.wait('@createPostRequest');
        cy.url().should('include', '/admin/dashboard');
    });
});