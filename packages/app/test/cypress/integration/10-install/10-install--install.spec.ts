describe('Install', () => {
  const ssPrefix = 'installer-';

  beforeEach(() => {
    cy.visit('/');
    cy.getByTestid('installerForm').should('be.visible');
  });

  it('Successfully show installer', () => {
    cy.screenshot(`${ssPrefix}-redirect-to-installer-page`);
  });

  it('Sccessfully choose languages', () => {
    cy.getByTestid('dropdownLanguage').should('be.visible');

    // open Language Dropdown, wait for language data to load
    cy.waitUntil(() => {
      // do
      cy.getByTestid('dropdownLanguage').click();
      // wati until
      return cy.get('.dropdown-menu').then($elem => $elem.is(':visible'));
    });

    cy.getByTestid('dropdownLanguageMenu-en_US').click();
    cy.get('.alert-success').should('be.visible');
    cy.screenshot(`${ssPrefix}-select-en_US`);

    cy.getByTestid('dropdownLanguage').click();
    cy.get('.dropdown-menu').should('be.visible');
    cy.getByTestid('dropdownLanguageMenu-ja_JP').click();
    cy.get('.alert-success').should('be.visible');
    cy.screenshot(`${ssPrefix}-select-ja_JP`);

    cy.getByTestid('dropdownLanguage').click();
    cy.get('.dropdown-menu').should('be.visible');
    cy.getByTestid('dropdownLanguageMenu-zh_CN').click();
    cy.get('.alert-success').should('be.visible');
    cy.screenshot(`${ssPrefix}-select-zh_CN`);
  });

  it('Successfully installing and redirect to root page', () => {
    cy.fixture("user-admin.json").then(user => {
      cy.getByTestid('tiUsername').type(user.username);
      cy.getByTestid('tiName').type(user.name);
      cy.getByTestid('tiEmail').type(user.email);
      cy.getByTestid('tiPassword').type(user.password);
    });
    cy.screenshot(`${ssPrefix}-before-submit`);

    cy.getByTestid('btnSubmit').click();

    // Redirects to the root page take a long time (more than 10000ms)
    cy.getByTestid('grw-pagetree-item-container', { timeout: 20000 }).should('be.visible');

    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}-installed-redirect-to-root-page`);
  });
});
