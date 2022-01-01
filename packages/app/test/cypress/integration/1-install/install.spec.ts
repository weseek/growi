describe('Installer', () => {
  it('successfully loads', () => {
    cy.visit('/'); // change URL to match your dev URL
    cy.screenshot('on-load');

    cy.getByTestid('installerForm').should('be.visible');
  });

  it('the dropdown for language works', () => {
    cy.getByTestid('dropdownLanguage').should('be.visible');

    cy.getByTestid('dropdownLanguage').click();
    cy.screenshot('open-dropdownLanguage');
    cy.getByTestid('dropdownLanguage').click(); // close

    cy.getByTestid('dropdownLanguage').click();
    cy.getByTestid('dropdownLanguageMenu-en_US').click();
    cy.screenshot('select-en_US');

    cy.getByTestid('dropdownLanguage').click();
    cy.getByTestid('dropdownLanguageMenu-ja_JP').click();
    cy.screenshot('select-ja_JP');

    cy.getByTestid('dropdownLanguage').click();
    cy.getByTestid('dropdownLanguageMenu-zh_CN').click();
    cy.screenshot('select-zh_CN');
  });

});
