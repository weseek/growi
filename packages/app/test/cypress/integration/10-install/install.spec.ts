context('Installer', () => {

  const ssPrefix = 'installer-';

  beforeEach(() => {
    cy.visit('/');
  })

  it('successfully loads', () => {
    cy.screenshot(`${ssPrefix}-on-load`);
    cy.getByTestid('installerForm').should('be.visible');
  });

  it('the dropdown for language works', () => {
    cy.getByTestid('dropdownLanguage').should('be.visible');

    cy.getByTestid('dropdownLanguage').click();
    cy.screenshot(`${ssPrefix}-open-dropdownLanguage`);
    cy.getByTestid('dropdownLanguage').click(); // close

    cy.getByTestid('dropdownLanguage').click();
    cy.getByTestid('dropdownLanguageMenu-en_US').click();
    cy.screenshot(`${ssPrefix}-select-en_US`);

    cy.getByTestid('dropdownLanguage').click();
    cy.getByTestid('dropdownLanguageMenu-ja_JP').click();
    cy.screenshot(`${ssPrefix}-select-ja_JP`);

    cy.getByTestid('dropdownLanguage').click();
    cy.getByTestid('dropdownLanguageMenu-zh_CN').click();
    cy.screenshot(`${ssPrefix}-select-zh_CN`);
  });

});

context('Installing', () => {

  const ssPrefix = 'installing-';

  beforeEach(() => {
    cy.visit('/');
  })

  it('has succeeded', () => {
    cy.fixture("user-admin.json").then(user => {
      cy.getByTestid('tiUsername').type(user.username);
      cy.getByTestid('tiName').type(user.name);
      cy.getByTestid('tiEmail').type(user.email);
      cy.getByTestid('tiPassword').type(user.password);
    });
    cy.screenshot(`${ssPrefix}-before-submit`);

    cy.getByTestid('btnSubmit').click();

    cy.screenshot(`${ssPrefix}-installed`, {
      blackout: ['#grw-sidebar-contents-wrapper','[data-line="2"]:eq(0) > a > img', '[data-hide-in-vrt=true]'],
    });
  });

});
