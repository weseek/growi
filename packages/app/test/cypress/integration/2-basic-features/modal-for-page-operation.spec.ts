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
