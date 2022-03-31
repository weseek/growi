
context('Access to special pages', () => {
  const ssPrefix = 'access-to-special-pages-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('/trash is successfully loaded', () => {
    cy.visit('/trash', {  });
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

    cy.getByTestid('tags-page').should('be.visible');
    cy.screenshot(`${ssPrefix}-tags`);
  });

});
