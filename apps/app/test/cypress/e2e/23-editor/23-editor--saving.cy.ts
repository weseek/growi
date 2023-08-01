context('PageCreateModal', () => {

  const ssPrefix = 'page-create-modal-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it("PageCreateModal is shown and closed successfully", () => {
    cy.visit('/');
    cy.collapseSidebar(true, true);

    cy.waitUntil(() => {
      // do
      cy.getByTestid('newPageBtn').click({force: true});
      // wait until
      return cy.getByTestid('page-create-modal').then($elem => $elem.is(':visible'));
    });

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}new-page-modal-opened`);
      cy.get('button.close').click();
    });

    cy.screenshot(`${ssPrefix}page-create-modal-closed`);
  });

  it("Successfully Create Today's page", () => {
    const pageName = "Today's page";
    cy.visit('/');
    cy.collapseSidebar(true);

    cy.waitUntil(() => {
      // do
      cy.getByTestid('newPageBtn').click({force: true});
      // wait until
      return cy.getByTestid('page-create-modal').then($elem => $elem.is(':visible'));
    });

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.page-today-input2').type(pageName);
      cy.screenshot(`${ssPrefix}today-add-page-name`);
      cy.getByTestid('btn-create-memo').click();
    });

    cy.getByTestid('page-editor').should('be.visible');
    cy.getByTestid('save-page-btn').as('save-page-btn').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.get('@save-page-btn').click();
      // wait until
      return cy.get('@save-page-btn').then($elem => $elem.is(':disabled'));
    });
    cy.get('.layout-root').should('not.have.class', 'editing');

    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}create-today-page`);
  });

  it('Successfully create page under specific path', () => {
    const pageName = 'child';

    cy.visit('/foo/bar');
    cy.collapseSidebar(true);

    cy.waitUntil(() => {
      // do
      cy.getByTestid('newPageBtn').click({force: true});
      // wait until
      return cy.get('body').within(() => {
        return Cypress.$('[data-testid=page-create-modal]').is(':visible');
      });
    });

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').should('have.value', '/foo/bar/');
      cy.get('.rbt-input-main').type(pageName);
      cy.screenshot(`${ssPrefix}under-path-add-page-name`);
      cy.getByTestid('btn-create-page-under-below').click();
    });

    cy.getByTestid('page-editor').should('be.visible');
    cy.getByTestid('save-page-btn').as('save-page-btn').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.get('@save-page-btn').click();
      // wait until
      return cy.get('@save-page-btn').then($elem => $elem.is(':disabled'));
    });
    cy.get('.layout-root').should('not.have.class', 'editing');

    cy.getByTestid('grw-contextual-sub-nav').should('be.visible');

    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}create-page-under-specific-page`);
  });

  it('Trying to create template page under the root page fail', () => {
    cy.visit('/');
    cy.collapseSidebar(true);

    cy.waitUntil(() => {
      // do
      cy.getByTestid('newPageBtn').click({force: true});
      // wait until
      return cy.getByTestid('page-create-modal').then($elem => $elem.is(':visible'));
    });

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.getByTestid('grw-page-create-modal-path-name').should('have.text', '/');

      cy.get('#template-type').click();
      cy.get('#template-type').next().find('button:eq(0)').click({force: true});
      cy.getByTestid('grw-btn-edit-page').should('be.visible').click();
    });
    cy.get('.Toastify__toast').should('be.visible');

    cy.screenshot(`${ssPrefix}create-template-for-children-error`);

    cy.get('.Toastify__toast').should('be.visible').within(() => {
      cy.get('.Toastify__close-button').should('be.visible').click();
      cy.get('.Toastify__progress-bar').invoke('attr', 'style', 'display: none')
    });

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('#template-type').click();
      cy.get('#template-type').next().find('button:eq(1)').click({force: true});
      cy.getByTestid('grw-btn-edit-page').should('be.visible').click();
    });
    cy.get('.Toastify__toast').should('be.visible');
    cy.screenshot(`${ssPrefix}create-template-for-descendants-error`);
  });

});


context('Shortcuts', () => {
  const ssPrefix = 'shortcuts';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('Successfully updating a page using a shortcut on a previously created page', { scrollBehavior: false }, () => {
    const body1 = 'hello';
    const body2 = ' world!';
    const savePageShortcutKey = '{ctrl+s}';

    cy.visit('/Sandbox/child');

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

    // 1st
    cy.get('.CodeMirror').type(body1);
    cy.get('.CodeMirror').contains(body1);
    cy.get('.page-editor-preview-body').contains(body1);
    cy.get('.CodeMirror').type(savePageShortcutKey);

    cy.get('.Toastify__toast').should('be.visible').within(() => {
      cy.get('.Toastify__close-button').should('be.visible').click();
      cy.get('.Toastify__progress-bar').invoke('attr', 'style', 'display: none')
    });
    cy.screenshot(`${ssPrefix}-update-page-1`);

    cy.get('.Toastify').should('not.be.visible');

    // 2nd
    cy.get('.CodeMirror').type(body2);
    cy.get('.CodeMirror').contains(body2);
    cy.get('.page-editor-preview-body').contains(body2);
    cy.get('.CodeMirror').type(savePageShortcutKey);

    cy.get('.Toastify__toast').should('be.visible').within(() => {
      cy.get('.Toastify__close-button').should('be.visible').click();
      cy.get('.Toastify__progress-bar').invoke('attr', 'style', 'display: none')
    });
    cy.screenshot(`${ssPrefix}-update-page-2`);
  });
});
