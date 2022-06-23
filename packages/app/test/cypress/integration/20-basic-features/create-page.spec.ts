context('Create pgae', () => {
  const ssPrefix = 'create-page-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('Successfuly open new page modal', () => {
    cy.visit('/');
    cy.getByTestid('newPageBtn').click();
    cy.screenshot(`${ssPrefix}click-new-page`);

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}new-page-modal-opened`);
      cy.get('button.close').click();

    });
  });

  it("Successfully Create Today's page", () => {
    const pageName = 'abcdefg';
    const content = 'Test \n test';
    cy.visit('/');
    cy.getByTestid('newPageBtn').click();
    cy.screenshot(`${ssPrefix}today-click-new-page`);

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.page-today-input2').type(pageName);
      cy.screenshot(`${ssPrefix}today-add-page-name`);
      cy.getByTestid('btn-create-memo').click();
    });


    cy.getByTestid('page-editor').should('be.visible');

    cy.get('.CodeMirror textarea').type(content, {force: true});
    cy.screenshot(`${ssPrefix}today-add-text-content`);

    cy.get('.btn-submit').eq(0).click();

   cy.get('body').should('not.have.class', 'on-edit');
    cy.screenshot(`${ssPrefix}today-save`);
  });
})
