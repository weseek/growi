import path from 'path-browserify';

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
  cy.get('.CodeMirror').should('be.visible');
}

context('Editor while uploading to a new page', () => {

  const ssPrefix = 'editor-while-uploading-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  // for https://redmine.weseek.co.jp/issues/122040
  it('should not be cleared and should prevent GrantSelector from modified', { scrollBehavior: false }, () => {
    cy.visit('/Sandbox/for-122040');

    openEditor();

    cy.screenshot(`${ssPrefix}-prevent-grantselector-modified-1`);

    // input the body
    const body = 'Hello World!';
    cy.get('.CodeMirror').type(body + '\n\n');
    cy.get('.CodeMirror').should('contain.text', body);

    // open GrantSelector
    cy.waitUntil(() => {
      // do
      cy.getByTestid('grw-grant-selector').within(() => {
        cy.get('button.dropdown-toggle').click({force: true});
      });
      // wait until
      return cy.getByTestid('grw-grant-selector').within(() => {
        return Cypress.$('.dropdown-menu.show').is(':visible');
      });
    });

    // Select "Only me"
    cy.getByTestid('grw-grant-selector').within(() => {
      // click "Only me"
      cy.get('.dropdown-menu.show').find('.dropdown-item').should('have.length', 4).then((menuItems) => {
        menuItems[2].click();
      });
    });

    cy.getByTestid('grw-grant-selector').find('.dropdown-toggle').should('contain.text', 'Only me');
    cy.screenshot(`${ssPrefix}-prevent-grantselector-modified-2`);

    // drag-drop a file
    const filePath = path.relative('/', path.resolve(Cypress.spec.relative, '../assets/example.txt'));
    cy.get('.dropzone').selectFile(filePath, { action: 'drag-drop' });

    // expect
    cy.get('.CodeMirror').should('contain.text', body);
    cy.get('.CodeMirror').should('contain.text', '[example.txt](/attachment/');
    cy.getByTestid('grw-grant-selector').find('.dropdown-toggle').should('contain.text', 'Only me');
    cy.screenshot(`${ssPrefix}-prevent-grantselector-modified-3`);
  });

});

context.skip('Editor while navigation', () => {

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
