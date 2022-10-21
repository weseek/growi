context('Access to page by guest', () => {
  const ssPrefix = 'access-to-page-by-guest-';

  it('/Sandbox is successfully loaded', () => {
    cy.visit('/Sandbox', {  });
    cy.collapseSidebar(true, true);
    cy.screenshot(`${ssPrefix}-sandbox`);
  });

  it('/Sandbox with anchor hash is successfully loaded', () => {
    cy.visit('/Sandbox#Headers');
    cy.collapseSidebar(true, true);

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);

    // hide fab // disable fab for sticky-events warning
    // cy.getByTestid('grw-fab-container').invoke('attr', 'style', 'display: none');

    cy.screenshot(`${ssPrefix}-sandbox-headers`);
  });

  it('/Sandbox/Math is successfully loaded', () => {
    cy.visit('/Sandbox/Math');
    cy.collapseSidebar(true, true);

    cy.get('mjx-container').should('be.visible');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000); // wait for 2 seconds for MathJax.typesetPromise();

    cy.screenshot(`${ssPrefix}-sandbox-math`);
  });

  it('/Sandbox with edit is successfully loaded', () => {
    cy.visit('/Sandbox#edit');
    cy.collapseSidebar(true, true);

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.screenshot(`${ssPrefix}-sandbox-edit-page`);
  })

});


context('Access to /me page', () => {
  const ssPrefix = 'access-to-me-page-by-guest-';

  beforeEach(() => {
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('/me should be redirected to /login', () => {
    cy.visit('/me', {  });
    cy.screenshot(`${ssPrefix}-me`);
  });

});


context('Access to special pages by guest', () => {
  const ssPrefix = 'access-to-special-pages-by-guest-';

  it('/trash is successfully loaded', () => {
    cy.visit('/trash', {  });
    cy.collapseSidebar(true, true);
    cy.getByTestid('trash-page-list').should('be.visible');
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
