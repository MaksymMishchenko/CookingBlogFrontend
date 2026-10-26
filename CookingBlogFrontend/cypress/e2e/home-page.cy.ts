import { API_ENDPOINTS } from "../../src/app/core/constants/api-endpoints";

describe('HomePageComponent (Mocked E2E)', () => {
    const apiUrl = `**/api/${API_ENDPOINTS.PUBLIC_POSTS}*`;
    const categoriesUrl = `**/${API_ENDPOINTS.CATEGORIES}`;
    const homeUrl = '/';
    const FIXTURE_POSTS = 'posts/posts';
    const FIXTURE_EMPTY_POSTS = 'posts/empty-posts';

    const getEl = (tag: string) => cy.get(`[cy-data="${tag}"]`, { timeout: 8000 });

    beforeEach(() => {
        cy.intercept('GET', '**/images/test-image.jpeg', {
            fixture: 'images/test-image.jpeg,null',
            headers: { 'content-type': 'image/jpeg' }
        }).as('getPostImage');

        cy.intercept('GET', categoriesUrl, {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { id: 1, name: 'Main Course' },
                    { id: 2, name: 'Desserts' }
                ]
            }
        }).as('getCategories');
    });

    it('should show the loading block while the posts request is pending', () => {
        cy.intercept('GET', apiUrl, {
            delay: 1000,
            statusCode: 200,
            body: {
                data: [],
                success: true,
                pageNumber: 1,
                pageSize: 10,
                totalCount: 0,
                appliedFilters: {}
            }
        }).as('getPostsPending');

        cy.visit(homeUrl);

        getEl('loading').should('be.visible');
    });

    it('should show no posts found after the posts request', () => {
        cy.intercept('GET', apiUrl, { fixture: FIXTURE_EMPTY_POSTS }).as('getEmptyPosts');

        cy.visit(homeUrl);
        cy.wait('@getEmptyPosts');

        getEl('no-posts-message')
            .should('be.visible')
            .and('contain', 'No posts found.');

        getEl('post-list-container').should('not.exist');
    });

    it('should show error message when posts request fails', () => {
        cy.intercept('GET', apiUrl, {
            statusCode: 500,
            body: {}
        }).as('getPostsError');

        cy.visit(homeUrl);
        cy.wait('@getPostsError');

        getEl('error-message')
            .should('be.visible')
            .and('contain', 'Failed to load posts');

        getEl('post-list-container').should('not.exist');
    });

    it('should load and display posts successfully', () => {
        cy.intercept('GET', apiUrl, {
            delay: 300,
            fixture: FIXTURE_POSTS
        }).as('getAllPosts');

        cy.visit(homeUrl);

        getEl('loading').should('be.visible');

        cy.wait('@getAllPosts');

        getEl('loading').should('not.exist');
        getEl('post-list-container').should('be.visible');

        cy.get('app-post').first().within(() => {
            cy.contains('Author:').should('be.visible');
            cy.contains('Comments:').should('be.visible');

            cy.get('img')
                .should('be.visible')
                .and(($img) => {
                    expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
                });
        });
    });
});