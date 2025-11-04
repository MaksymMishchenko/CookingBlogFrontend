import { environment } from "../../src/environments/environment";

describe('HomePageComponent (e2e testing)', () => {

    const apiUrl = environment.apiUrl;
    const homeUrl = '/';
    const FIXTURE_POSTS = 'posts/posts';
    const FIXTURE_EMPTY_POSTS = 'posts/empty-posts';

    const getEl = (tag: string) => cy.get(`[cy-data="${tag}"]`, { timeout: 8000 });

    it('should show the loading block while the posts request is pending', () => {
        cy.intercept('GET', apiUrl).as('getPostsPending');

        cy.visit(homeUrl);

        getEl('loading')
            .should('be.visible')
            .and('contain', 'Loading...');
    });

    it('should show no posts found after the posts request', () => {
        cy.fixture(FIXTURE_EMPTY_POSTS).then((fixture) => {
            cy.intercept('GET', apiUrl, { body: fixture }).as('getEmptyPosts');

            cy.visit(homeUrl);
            cy.wait('@getEmptyPosts');

            getEl('no-posts-message')
                .should('be.visible')
                .and('contain', 'No posts found...');

            getEl('post-list-container')
                .should('not.exist');
        })
    });

    it('should load and display posts successfully', () => {
        cy.fixture(FIXTURE_POSTS).then((fixture) => {
            cy.intercept('GET', apiUrl, {
                delay: 300,
                body: fixture
            }).as('getAllPosts')

            cy.visit(homeUrl);

            getEl('loading')
                .should('be.visible')
                .and('contain', 'Loading...');

            cy.wait('@getAllPosts');

            getEl('loading')
                .should('not.exist');
            getEl('post-list-container')
                .should('be.visible');

            cy.get('app-post')
                .should('have.length', fixture.dataList.length);

            cy.get('[cy-data="post-list-container"]', { timeout: 8000 })
                .should('contain', 'First Test Post')
                .and('contain', 'Second Test Post');

            cy.get('app-post').first().within(() => {
                cy.contains('Author: Test Author 1');
                cy.contains('Comments: 2');
            });
        })
    });

});

