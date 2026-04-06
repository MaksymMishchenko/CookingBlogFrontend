describe('HomePageComponent (Mocked E2E)', () => {
    const apiUrl = '**/api/posts*';
    const homeUrl = '/';
    const FIXTURE_POSTS = 'posts/posts';
    const FIXTURE_EMPTY_POSTS = 'posts/empty-posts';

    const getEl = (tag: string) => cy.get(`[cy-data="${tag}"]`, { timeout: 8000 });    

    it('should show the loading block while the posts request is pending', () => {        
        cy.intercept('GET', apiUrl, {
            delay: 1000,          
            statusCode: 200,  
            body: { items: [], totalCount: 0 }
        }).as('getPostsPending');

        cy.visit(homeUrl);
        
        getEl('loading')
            .should('be.visible')
            .and('contain', 'Loading...');
    });

    it('should show no posts found after the posts request', () => {
        cy.intercept('GET', apiUrl, { fixture: FIXTURE_EMPTY_POSTS }).as('getEmptyPosts');

        cy.visit(homeUrl);
        cy.wait('@getEmptyPosts');

        getEl('no-posts-message')
            .should('be.visible')
            .and('contain', 'No posts found...');

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
        });
    });
});

