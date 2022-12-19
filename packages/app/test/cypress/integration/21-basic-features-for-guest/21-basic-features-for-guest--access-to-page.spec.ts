context('Access to page by guest', () => {
  const ssPrefix = 'access-to-page-by-guest-';

  it('/Sandbox is successfully loaded', () => {
    cy.visit('/Sandbox');
    cy.getByTestid('grw-pagetree-item-container').should('be.visible');
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-sandbox`);
  });

  it('/Sandbox with anchor hash is successfully loaded', () => {
    cy.visit('/Sandbox#Headers');
    cy.getByTestid('grw-pagetree-item-container').should('be.visible');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    // cy.wait(500);

    // hide fab // disable fab for sticky-events warning
    // cy.getByTestid('grw-fab-container').invoke('attr', 'style', 'display: none');

    cy.collapseSidebar(true, true);
    cy.screenshot(`${ssPrefix}-sandbox-headers`);
  });

  it('/Sandbox/Math is successfully loaded', () => {
    cy.visit('/Sandbox/Math');
    cy.getByTestid('revision-toc-content').should('be.visible');

    cy.get('.math').should('be.visible');

    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-sandbox-math`, {
      blackout: ['.revision-toc', '[data-hide-in-vrt=true]']
    });
  });

  it('/Sandbox with edit is successfully loaded', () => {
    cy.visit('/Sandbox#edit');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-sandbox-edit-page`);
  })

});


context('Access to /me page', () => {
  const ssPrefix = 'access-to-me-page-by-guest-';

  it('/me should be redirected to /login', () => {
    cy.visit('/me');
    cy.getByTestid('login-form').should('be.visible');
    cy.screenshot(`${ssPrefix}-me`);
  });

});


context('Access to special pages by guest', () => {
  const ssPrefix = 'access-to-special-pages-by-guest-';

  it('/trash is successfully loaded', () => {
    cy.visit('/trash', {  });
    cy.getByTestid('trash-page-list').should('be.visible');
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-trash`);
  });

  it('/tags is successfully loaded', () => {
    cy.visit('/tags');

    // open sidebar
    cy.collapseSidebar(false);
    // select tags
    cy.getByTestid('grw-sidebar-nav-primary-tags').click();
    cy.getByTestid('grw-sidebar-content-tags').should('be.visible');
    cy.getByTestid('grw-tags-list').should('be.visible');
    cy.getByTestid('grw-tags-list').contains('You have no tag, You can set tags on pages');

    cy.getByTestid('tags-page').should('be.visible');
    cy.screenshot(`${ssPrefix}-tags`);
  });

});
