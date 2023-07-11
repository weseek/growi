context('TemplateModal', () => {

  const ssPrefix = 'template-modal-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it("TemplateModal is shown and closed successfully", () => {
    cy.visit('/Sandbox/child');

    // move to edit mode
    cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.get('@pageEditorModeManager').within(() => {
        cy.get('button:nth-child(2)').click();
      });
      // until
      return cy.get('.layout-root').then($elem => $elem.hasClass('editing'));
    })
    cy.get('.grw-editor-navbar-bottom').should('be.visible');

    // show TemplateModal
    cy.waitUntil(() => {
      // do
      cy.get('.navbar-editor > ul > li:nth-child(16) > button').click({force: true});
      // wait until
      return cy.getByTestid('template-modal').then($elem => $elem.is(':visible'));
    });

    // close TemplateModal
    cy.getByTestid('template-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}opened`);
      cy.get('button.close').click();
    });

    cy.collapseSidebar(true, true);
    cy.screenshot(`${ssPrefix}close`);
  });

  it("Successfully select template and template locale", () => {
    cy.visit('/Sandbox/child');

    // move to edit mode
    cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.get('@pageEditorModeManager').within(() => {
        cy.get('button:nth-child(2)').click();
      });
      // until
      return cy.get('.layout-root').then($elem => $elem.hasClass('editing'));
    })
    cy.get('.grw-editor-navbar-bottom').should('be.visible');

    // show TemplateModal
    cy.waitUntil(() => {
      // do
      cy.get('.navbar-editor > ul > li:nth-child(16) > button').click({force: true});
      // wait until
      return cy.getByTestid('template-modal').then($elem => $elem.is(':visible'));
    });

    // select template and template locale
    cy.getByTestid('template-modal').should('be.visible').within(() => {
      // select first template
      cy.get('.list-group > .list-group-item:nth-child(1)').click();
      // check preview exist
      cy.get('.card-body > .page-editor-preview-body > .wiki').should('exist');
      cy.screenshot(`${ssPrefix}select-template`);

      // change template locale
      cy.get('.modal-body > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > .dropdown > button').click();
      cy.get('.modal-body > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > .dropdown > div > button:nth-child(2)').click();
      cy.screenshot(`${ssPrefix}select-template-locale`);

      // click insert button
      cy.get('.modal-footer > button:nth-child(2)').click();
    });

    // check show template on markdown
    cy.collapseSidebar(true, true);
    cy.screenshot(`${ssPrefix}insert-template`);
  });

});
