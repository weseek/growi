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
    cy.screenshot(`${ssPrefix}-pagetree-before-load`, { capture: 'viewport' });
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
  });

  it("PageCreateModal is shown successfully", () => {
    cy.visit('/me');

    cy.getByTestid('newPageBtn').click();

    cy.getByTestid('page-create-modal').should('be.visible').screenshot(`${ssPrefix}-open`);

    cy.getByTestid('row-create-page-under-below').find('input.form-control').clear().type('/new-page');
    cy.getByTestid('btn-create-page-under-below').click();

    cy.getByTestid('page-editor').should('be.visible');
    cy.screenshot(`${ssPrefix}-create-clicked`, {capture: 'viewport'});
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

  it('PresentationModal for "/Sandbox/Bootstrap4" is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4');

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-presentation-modal-btn').click({force: true});
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-open-bootstrap4`);
  });

  it('PresentationModal for /Sandbox/Bootstrap4#Cards" is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4#Cards');

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-presentation-modal-btn').click({force: true});
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-open-bootstrap4-with-ancker-link`);
  });
});
