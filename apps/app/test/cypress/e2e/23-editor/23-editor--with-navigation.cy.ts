import path from 'path-browserify';

function openEditor() {
  cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
  cy.getByTestid('editor-button').click();
  cy.getByTestid('grw-editor-navbar-bottom').should('be.visible');
  cy.get('.cm-content').should('be.visible');
}

context('Editor while uploading to a new page', () => {

  const ssPrefix = 'editor-while-uploading-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  /**
   * for the issues:
   * @see https://redmine.weseek.co.jp/issues/122040
   * @see https://redmine.weseek.co.jp/issues/124281
   */
  it('should not be cleared and should prevent GrantSelector from modified', { scrollBehavior: false }, () => {
    cy.visit('/Sandbox/for-122040');

    openEditor();

    cy.screenshot(`${ssPrefix}-prevent-grantselector-modified-1`);

    // input the body
    const body = 'Hello World!';
    cy.get('.cm-content').should('be.visible').type(body, { force: true });
    cy.getByTestid('page-editor-preview-body').should('contain.text', body);

    // open GrantSelector
    cy.waitUntil(() => {
      // do
      cy.getByTestid('grw-grant-selector').within(() => {
        cy.get('button.dropdown-toggle').click({force: true});
      });
      // wait until
      return cy.getByTestid('grw-grant-selector-dropdown-menu').then($elem => $elem.is(':visible'))
    });

     // Select "Only me"
    cy.getByTestid('grw-grant-selector-dropdown-menu').find('.dropdown-item').should('have.length', 4).then((menuItems) => {
      // click "Only me"
      menuItems[2].click();
    })

    cy.getByTestid('grw-grant-selector').find('.dropdown-toggle').should('contain.text', 'Only me');
    cy.screenshot(`${ssPrefix}-prevent-grantselector-modified-2`);

    // intercept API req/res for fixing labels
    const dummyAttachmentId = '64b000000000000000000000';
    let uploadedAttachmentId = '';
    cy.intercept('POST', '/_api/v3/attachment', (req) => {
      req.continue((res) => {
        // store the attachment id
        uploadedAttachmentId = res.body.attachment._id;
        // overwrite filePathProxied
        res.body.attachment.filePathProxied = `/attachment/${dummyAttachmentId}`;
      });
    }).as('attachmentsAdd');
    cy.intercept('GET', `/_api/v3/attachment?attachmentId=${dummyAttachmentId}`, (req) => {
      // replace attachmentId query
      req.url = req.url.replace(dummyAttachmentId, uploadedAttachmentId);
      req.continue((res) => {
        // overwrite the attachment createdAt
        res.body.attachment.createdAt = new Date('2023-07-01T00:00:00');
      });
    });

    // drag-drop a file
    const filePath = path.relative('/', path.resolve(Cypress.spec.relative, '../assets/example.txt'));
    cy.get('.dropzone').eq(0).selectFile(filePath, { action: 'drag-drop' });
    cy.wait('@attachmentsAdd');

    cy.screenshot(`${ssPrefix}-prevent-grantselector-modified-3`);

    // Update page using shortcut keys
    cy.get('.cm-content').click({force: true}).type('{ctrl+s}');

    cy.screenshot(`${ssPrefix}-prevent-grantselector-modified-4`);

    // expect
    cy.get('.Toastify__toast').should('contain.text', 'Saved successfully');
    cy.get('.cm-content').should('contain.text', body);
    cy.get('.cm-content').should('contain.text', '[example.txt](/attachment/64b000000000000000000000');
    cy.getByTestid('grw-grant-selector').find('.dropdown-toggle').should('contain.text', 'Only me');
    cy.screenshot(`${ssPrefix}-prevent-grantselector-modified-5`);
  });

});

context('Editor while navigation', () => {

  const ssPrefix = 'editor-while-navigation-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  /**
   * for the issue:
   * @see https://redmine.weseek.co.jp/issues/115285
   */
  it('Successfully updating the page body', { scrollBehavior: false }, () => {
    const page1Path = '/Sandbox/for-115285/page1';
    const page2Path = '/Sandbox/for-115285/page2';

    cy.visit(page1Path);

    openEditor();

    // page1
    const bodyHello = 'hello';
    cy.get('.cm-content').should('be.visible').type(bodyHello, { force: true });
    cy.getByTestid('page-editor-preview-body').should('contain.text', bodyHello);
    // cy.getByTestid('page-editor').should('be.visible');
    cy.get('.cm-content').screenshot(`${ssPrefix}-editor-for-page1`);

    // save page1
    cy.getByTestid('save-page-btn').click();

    // open duplicate modal
    cy.waitUntil(() => {
      // do
      cy.getByTestid('grw-contextual-sub-nav').within(() => {
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
    cy.get('.cm-content').screenshot(`${ssPrefix}-editor-for-page2`);

    // type (without save)
    const bodyWorld = ' world!!'
    cy.get('.cm-content').should('be.visible').type(`{moveToEnd}${bodyWorld}`, { force: true });
    cy.getByTestid('page-editor-preview-body').should('contain.text', `${bodyHello}${bodyWorld}`);
    cy.get('.cm-content').screenshot(`${ssPrefix}-editor-for-page2-modified`);

    // create a link to page1
    cy.get('.cm-content').type('\n\n[page1](./page1)');

    // go to page1
    cy.getByTestid('page-editor-preview-body').within(() => {
      cy.get("a:contains('page1')").click();
    });

    openEditor();

    cy.get('.cm-content').screenshot(`${ssPrefix}-editor-for-page1-returned`);

    // expect
    cy.get('.cm-content').should('contain.text', bodyHello);
    cy.get('.cm-content').should('not.contain.text', bodyWorld); // text that added to page2
    cy.get('.cm-content').should('not.contain.text', 'page1'); // text that added to page2
  });
});
