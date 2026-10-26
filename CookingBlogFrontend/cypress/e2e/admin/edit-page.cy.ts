import { API_ENDPOINTS } from "../../../src/app/core/constants/api-endpoints";

describe('Admin Edit Post (e2e testing)', () => {
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
                    { id: 10, title: 'Old Post Title', categoryName: 'Main Course', isActive: false }
                ]
            }
        }).as('getPosts');

        cy.intercept('GET', `**/${API_ENDPOINTS.ADMIN_POSTS}/10`, {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    id: 10,
                    title: 'Old Post Title',
                    description: 'Old description',
                    content: '<p>Old long enough content body for testing purposes, it must be at least one hundred characters long to pass.</p>',
                    previewImageUrl: 'https://example.com/old.jpg',
                    previewImageAlt: '',
                    metaTitle: '',
                    metaDescription: '',
                    slug: 'old-post-title',
                    categoryId: 1,
                    isActive: false
                }
            }
        }).as('getPostById');

        cy.intercept('PUT', `**/${API_ENDPOINTS.ADMIN_POSTS}/10`, {
            statusCode: 200,
            body: { success: true, data: { id: 10 } }
        }).as('updatePostRequest');

        cy.loginAsAdmin();
    });

    it('should successfully edit an existing post', () => {
        cy.visit('/admin/post/10/edit');
        cy.wait('@getPostById');

        cy.get('[data-cy="title-input"]').clear().type('Updated Cypress Test Post');
        cy.get('[data-cy="description-input"]').clear().type('This is an updated test description.');
        cy.get('[data-cy="content-input"] .ql-editor').clear().type(
            'This is an updated long enough content body for the test post that satisfies the one hundred character requirement.',
            { delay: 0 }
        );
       
        cy.contains('button', 'Remove').click();
        cy.get('[data-cy="image-upload-input"]').selectFile({
            contents: Cypress.Buffer.from('new fake image content'),
            fileName: 'updated-image.jpg',
            mimeType: 'image/jpeg',
            lastModified: Date.now(),
        }, { force: true });

        cy.get('[data-cy="slug-input"]').clear().type('updated-cypress-test-post');
        cy.get('[data-cy="categoryId-select"]').select('Main Course');
        cy.get('[data-cy="isActive-select"]').select('Active (Visible on site)');

        cy.get('[data-cy="submit-btn"]').should('not.be.disabled').click();

        cy.wait('@updatePostRequest');
        cy.url().should('include', '/admin/dashboard');
    });
});