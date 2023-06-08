function openEditor() {
  cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
  cy.waitUntil(() => {
    // do
    cy.get('@pageEditorModeManager').within(() => {
      cy.get('button:nth-child(2)').click();
    });
    // until
    return cy.get('.layout-root').then($elem => $elem.hasClass('editing'));
  })
}

context('Editor while navigation', () => {

  const ssPrefix = 'editor-while-navigation-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  // for https://redmine.weseek.co.jp/issues/115285
  it('Successfully updating the page body', { scrollBehavior: false }, () => {
    const page1Path = '/Sandbox/for-115285/page1';
    const page2Path = '/Sandbox/for-115285/page2';

    cy.visit(page1Path);

    openEditor();

    // page1
    const bodyHello = 'hello';
    cy.get('.CodeMirror').type(bodyHello);
    cy.get('.CodeMirror').should('contain.text', bodyHello);
    cy.get('.page-editor-preview-body').should('contain.text', bodyHello);
    cy.getByTestid('page-editor').should('be.visible');
    cy.get('.CodeMirror').screenshot(`${ssPrefix}-editor-for-page1`);

    // save page1
    cy.getByTestid('save-page-btn').click();

    // open duplicate modal
    cy.waitUntil(() => {
      // do
      cy.get('#grw-subnav-container').within(() => {
        cy.getByTestid('open-page-item-control-btn').find('button').click({force: true});
      });
      // wait until
      return cy.getByTestid('page-item-control-menu').then($elem => $elem.is(':visible'))
    });
    cy.getByTestid('open-page-duplicate-modal-btn').filter(':visible').click({force: true});

    // duplicate and navigate to page1
    cy.getByTestid('page-duplicate-modal').should('be.visible').within(() => {
      cy.get('input.form-control').clear();
      cy.get('input.form-control').type(page2Path);
      cy.getByTestid('btn-duplicate').click();
    })

    openEditor();

    cy.get('.CodeMirror').screenshot(`${ssPrefix}-editor-for-page2`);

    // type (without save)
    const bodyWorld = ' world!!'
    cy.get('.CodeMirror').type(`${bodyWorld}`);
    cy.get('.CodeMirror').should('contain.text', `${bodyHello}${bodyWorld}`);
    cy.get('.page-editor-preview-body').should('contain.text', `${bodyHello}${bodyWorld}`);
    cy.get('.CodeMirror').screenshot(`${ssPrefix}-editor-for-page2-modified`);

    // create a link to page1
    cy.get('.CodeMirror').type('\n\n[page1](./page1)');

    // go to page1
    cy.get('.page-editor-preview-body').within(() => {
      cy.get("a:contains('page1')").click();
    });

    openEditor();

    cy.get('.CodeMirror').screenshot(`${ssPrefix}-editor-for-page1-returned`);

    // expect
    cy.get('.CodeMirror').should('contain.text', bodyHello);
    cy.get('.CodeMirror').should('not.contain.text', bodyWorld); // text that added to page2
    cy.get('.CodeMirror').should('not.contain.text', 'page1'); // text that added to page2
  });
});
