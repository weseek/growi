context('TemplateModal', () => {

  const ssPrefix = 'template-modal-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it("TemplateModal is shown and closed successfully", () => {
    cy.visit('/Sandbox/TemplateModal');
    cy.collapseSidebar(true, true);

    // move to edit mode
    cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
    cy.getByTestid('editor-button').click();
    cy.getByTestid('grw-editor-navbar-bottom').should('be.visible');

    // open TemplateModal
    cy.getByTestid('open-template-button').click();
    cy.getByTestid('template-modal').should('be.visible');
    cy.screenshot(`${ssPrefix}opened`);

    // close TemplateModal
    cy.getByTestid('template-modal').should('be.visible').within(() => {
      cy.get('.btn-close').click();
    });
    cy.screenshot(`${ssPrefix}close`);
  });

  it("Successfully select template and template locale", () => {
    cy.visit('/Sandbox/TemplateModal');
    cy.collapseSidebar(true, true);

    // move to edit mode
    cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
    cy.getByTestid('editor-button').click();
    cy.getByTestid('grw-editor-navbar-bottom').should('be.visible');

    // open TemplateModal
    cy.getByTestid('open-template-button').click();
    cy.getByTestid('template-modal').should('be.visible');

    // select template and template locale
    cy.getByTestid('template-modal').should('be.visible').within(() => {
      // select first template
      cy.get('.list-group > .list-group-item:nth-child(1)').click();
      // check preview exist
      cy.get('.card-body').should('be.visible');
      cy.screenshot(`${ssPrefix}select-template`);

      // change template locale
      cy.get('.modal-body > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > .dropdown > button').click();
      cy.get('.modal-body > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > .dropdown > div > button:nth-child(2)').click();
      cy.screenshot(`${ssPrefix}select-template-locale`);

      // click insert button
      cy.get('.modal-footer > button:nth-child(2)').click();
    });

    // check show template on markdown
    cy.screenshot(`${ssPrefix}insert-template`);
  });

});
