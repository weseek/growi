context('Access to /me page', () => {
  const ssPrefix = 'access-to-me-page-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('/me is successfully loaded', () => {
    cy.visit('/me', {  });
    cy.screenshot(`${ssPrefix}-me`);
  });

  it('Draft page is successfully shown', () => {
    cy.visit('/me/drafts');
    cy.screenshot(`${ssPrefix}-draft-page`);
  });

});
