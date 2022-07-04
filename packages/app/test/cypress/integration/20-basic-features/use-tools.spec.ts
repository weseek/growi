context('Switch Sidebar content', () => {
  const ssPrefix = 'switch-sidebar-content';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('PageTree is successfully shown', () => {
    cy.visit('/page');
    cy.getByTestid('grw-sidebar-nav-primary-page-tree').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-pagetree-after-load`, { capture: 'viewport' });
  });

});


context('Modal for page operation', () => {

  const ssPrefix = 'modal-for-page-operation-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    cy.collapseSidebar(true);
  });
  it("PageCreateModal is shown and closed successfully", () => {
    cy.visit('/');
    cy.getByTestid('newPageBtn').click();

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}new-page-modal-opened`);
      cy.get('button.close').click();

    });
    cy.screenshot(`${ssPrefix}page-create-modal-closed`, {capture: 'viewport'});
  });
  it("Successfully Create Today's page", () => {
    const pageName = 'abcdefg';
    cy.visit('/');
    cy.getByTestid('newPageBtn').click();

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.page-today-input2').type(pageName);
      cy.screenshot(`${ssPrefix}today-add-page-name`);
      cy.getByTestid('btn-create-memo').click();
    });
    cy.getByTestid('page-editor').should('be.visible').screenshot(`${ssPrefix}create-today-page`);
  });
  it('Successfully create page under specific path', () => {
    const pageName = 'testtest';
    cy.visit('/');
    cy.getByTestid('newPageBtn').click();

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').type(pageName);
      cy.screenshot(`${ssPrefix}under-path-add-page-name`);
      cy.getByTestid('btn-create-page-under-below').click();
    });
    cy.getByTestid('page-editor').should('be.visible').screenshot(`${ssPrefix}create-page-under-path`);
  });

  it('Successfully create a template page under the path', () => {
    const templatePath = 'testttttt';
    cy.visit('/');
    cy.getByTestid('newPageBtn').click();

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').type(templatePath);

      cy.screenshot(`${ssPrefix}create-template-for-children-add-path`);
      cy.get('#template-type').click();
      cy.get('#template-type').next().find('button:eq(0)').click({force: true});
      cy.get('#dd-template-type').next().find('button').click({force: true});
    });
    cy.get('.toast-error').should('be.visible').invoke('attr', 'style', 'opacity: 1');
    cy.screenshot(`${ssPrefix}create-template-for-children-error`, {capture: 'viewport'});
    cy.get('.toast-error').should('be.visible').click();

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').clear().type('/');

      cy.screenshot(`${ssPrefix}create-template-for-descendants-add-path`);
      cy.get('#template-type').click();
      cy.get('#template-type').next().find('button:eq(1)').click({force: true});
      cy.get('#dd-template-type').next().find('button').click({force: true});
    });
    cy.get('.toast-error').should('be.visible').invoke('attr', 'style', 'opacity: 1');
    cy.screenshot(`${ssPrefix}create-template-for-descendants-error`, {capture: 'viewport'});
    cy.get('.toast-error').should('be.visible').click();
    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('button.close').click();
    });
    cy.screenshot(`${ssPrefix}create-template-close-modal`, {capture: 'viewport'});

  });

  it('PageDeleteModal is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4');

     cy.get('#grw-subnav-container').within(() => {
       cy.getByTestid('open-page-item-control-btn').click();
       cy.getByTestid('open-page-delete-modal-btn').click();
    });

     cy.getByTestid('page-delete-modal').should('be.visible').screenshot(`${ssPrefix}-delete-bootstrap4`);
  });

  it('PageDuplicateModal is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4', {  });

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click();
      cy.getByTestid('open-page-duplicate-modal-btn').click();
    });

    cy.getByTestid('page-duplicate-modal').should('be.visible').screenshot(`${ssPrefix}-duplicate-bootstrap4`);
  });

  it('PageMoveRenameModal is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4', {  });

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click();
      cy.getByTestid('open-page-move-rename-modal-btn').click();
    });

    cy.getByTestid('page-rename-modal').should('be.visible').screenshot(`${ssPrefix}-rename-bootstrap4`);
  });

});


context('Open presentation modal', () => {

  const ssPrefix = 'access-to-presentation-modal-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('PresentationModal for "/" is shown successfully', () => {
    cy.visit('/');

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-presentation-modal-btn').click({force: true});
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-open-top`);
  });

});

context('Page Accessories Modal', () => {

  const ssPrefix = 'access-to-page-accessories-modal';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('Page History is shown successfully', () => {
     cy.visit('/Sandbox/Bootstrap4', {  });
     cy.get('#grw-subnav-container').within(() => {
       cy.getByTestid('open-page-item-control-btn').click();
       cy.getByTestid('open-page-accessories-modal-btn-with-history-tab').click();
    });

     cy.getByTestid('page-accessories-modal').should('be.visible')
     cy.getByTestid('page-history').should('be.visible')
     cy.screenshot(`${ssPrefix}-open-page-history-bootstrap4`);
  });
  it('Page Attachment Data is shown successfully', () => {
     cy.visit('/Sandbox/Bootstrap4', {  });
     cy.get('#grw-subnav-container').within(() => {
       cy.getByTestid('open-page-item-control-btn').click();
       cy.getByTestid('open-page-accessories-modal-btn-with-attachment-data-tab').click();
    });

     cy.getByTestid('page-accessories-modal').should('be.visible')
     cy.getByTestid('page-attachment').should('be.visible')
     cy.screenshot(`${ssPrefix}-open-page-attachment-data-bootstrap4`);
  });

});
