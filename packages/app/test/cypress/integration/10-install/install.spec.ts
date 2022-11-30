describe('Install', () => {
  const ssPrefix = 'installer-';

  beforeEach(() => {
    cy.visit('/');
  });

  it('Successfully show installer', () => {
    cy.getByTestid('installerForm').should('be.visible');
    cy.screenshot(`${ssPrefix}-redirect-to-installer-page`);
  });

  it('Sccessfully choose languages', () => {
    cy.getByTestid('installerForm').should('be.visible');
    cy.getByTestid('dropdownLanguage').should('be.visible');
    // TODO: should not use wait.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000); // waiting for load

    cy.getByTestid('dropdownLanguage').click();
    cy.get('.dropdown-menu').should('be.visible');
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

    // Requires a lot of time (more than 10000ms) for redirect to root page
    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}-installed-redirect-to-root-page`, {
      blackout: ['[data-hide-in-vrt=true]']
    });
  });
});
