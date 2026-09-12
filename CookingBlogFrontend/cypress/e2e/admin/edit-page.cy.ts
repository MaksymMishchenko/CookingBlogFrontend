describe('Admin Edit Post (e2e testing)', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
    });

    it('should successfully edit an existing post', () => {
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

        cy.intercept('GET', '**/admin/posts/10', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    id: 10,
                    title: 'Old Post Title',
                    description: 'Old description',
                    content: '<p>Old long enough content body for testing purposes...</p>',
                    author: 'Admin User',
                    imageUrl: 'https://example.com/old.jpg',
                    slug: 'old-post-title',
                    categoryId: 1,
                    isActive: false
                }
            }
        }).as('getPostById');

        cy.intercept('GET', '**/admin/posts**', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { id: 10, title: 'Updated Cypress Test Post', categoryName: 'Main Course', isActive: true }
                ]
            }
        }).as('getPosts');

        cy.intercept('PUT', '**/admin/posts/10', {
            statusCode: 200,
            body: { success: true, data: { id: 10 } }
        }).as('updatePostRequest');

        cy.visit('/admin/post/10/edit');

        cy.wait('@getCategories');
        cy.wait('@getPostById');

        cy.get('[data-cy="title-input"]').clear().type('Updated Cypress Test Post');
        cy.get('[data-cy="description-input"]').clear().type('This is an updated test description.');
        cy.get('[data-cy="content-input"] .ql-editor').clear().type('This is an updated long enough content body for the test post that satisfies requirements...');
        cy.get('[data-cy="slug-input"]').clear().type('updated-cypress-test-post');
        cy.get('[data-cy="categoryId-select"]').select('Main Course');
        cy.get('[data-cy="isActive-select"]').select(1);

        cy.get('[data-cy="submit-btn"]').click();

        cy.wait('@updatePostRequest');
        cy.url().should('include', '/admin/dashboard');
    });
});