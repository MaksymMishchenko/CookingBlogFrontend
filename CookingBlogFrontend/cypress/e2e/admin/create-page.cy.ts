import { API_ENDPOINTS } from "../../../src/app/core/constants/api-endpoints";

describe('Admin Create Post (e2e testing)', () => {
    const content =
        'This is a long enough content body for the test post. ' +
        'It is intentionally verbose so that it comfortably satisfies the ' +
        'minimum length requirement of one hundred characters.';

    beforeEach(() => {        
        cy.intercept('GET', '**/api/**', {
            statusCode: 200,
            body: { success: true, data: [] }
        });

        cy.intercept('GET', `**/${API_ENDPOINTS.CATEGORIES}`, {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { id: 1, name: 'Main Course' },
                    { id: 2, name: 'Desserts' }
                ]
            }
        }).as('getCategories');

        cy.intercept('GET', `**/${API_ENDPOINTS.ADMIN_POSTS}*`, {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { id: 10, title: 'New Cypress Test Post', categoryName: 'Main Course', isActive: true }
                ]
            }
        }).as('getPosts');

        cy.loginAsAdmin();
    });

    it('should successfully create a new post', () => {
        cy.intercept('POST', `**/${API_ENDPOINTS.ADMIN_POSTS}`, {
            statusCode: 201,
            body: { success: true, data: { id: 10 } }
        }).as('createPostRequest');

        cy.visit('/admin/create');
        cy.get('[data-cy="title-input"]').should('be.visible');

        cy.get('[data-cy="title-input"]').type('New Cypress Test Post');
        cy.get('[data-cy="description-input"]').type('This is a test description for the recipe.');
        cy.get('[data-cy="content-input"] .ql-editor').type(content, { delay: 0 });

        cy.get('[data-cy="image-upload-input"]').selectFile({
            contents: Cypress.Buffer.from('fake image content'),
            fileName: 'test-image.jpg',
            mimeType: 'image/jpeg',
            lastModified: Date.now(),
        }, { force: true });

        cy.get('[data-cy="slug-input"]').type('new-cypress-test-post');
        cy.get('[data-cy="categoryId-select"]').select('Main Course');
        cy.get('[data-cy="isActive-select"]').select('Active (Visible on site)');

        cy.get('[data-cy="submit-btn"]').should('not.be.disabled').click();

        cy.wait('@createPostRequest');
        cy.url().should('include', '/admin/dashboard');
    });
});