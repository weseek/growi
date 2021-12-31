describe('Installer', () => {
  it('successfully loads', () => {
    cy.visit('/'); // change URL to match your dev URL
    cy.screenshot('on-load');

    cy.get('[data-testid=installerForm]').should('be.visible');
  });

  it('the dropdown for language works', () => {
    cy.get('[data-testid=dropdownLanguage]').should('be.visible');

    cy.get('[data-testid=dropdownLanguage]').click();
    cy.screenshot('open-dropdownLanguage');
    cy.get('[data-testid=dropdownLanguage]').click(); // close

    cy.get('[data-testid=dropdownLanguage]').click();
    cy.get('[data-testid=dropdownLanguageMenu-en_US]').click();
    cy.screenshot('select-en_US');

    cy.get('[data-testid=dropdownLanguage]').click();
    cy.get('[data-testid=dropdownLanguageMenu-ja_JP]').click();
    cy.screenshot('select-ja_JP');

    cy.get('[data-testid=dropdownLanguage]').click();
    cy.get('[data-testid=dropdownLanguageMenu-zh_CN]').click();
    cy.screenshot('select-zh_CN');
  });

});
