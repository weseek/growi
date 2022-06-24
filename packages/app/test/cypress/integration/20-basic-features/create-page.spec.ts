context('Create pgae', () => {
  const ssPrefix = 'create-page-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(false);
  });

  it('Successfuly open new page modal', () => {
    cy.visit('/');
    cy.getByTestid('newPageBtn').click();
    cy.screenshot(`${ssPrefix}click-new-page`, {capture: 'viewport'});

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}new-page-modal-opened`);
      cy.get('button.close').click();

    });
  });

  it("Successfully Create Today's page", () => {
    const pageName = 'abcdefg';
    const textContent = '# TEST \n ## Test \n ### test';
    cy.visit('/');
    cy.getByTestid('newPageBtn').click();
    cy.screenshot(`${ssPrefix}today-click-new-page`, {capture: 'viewport'});

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.page-today-input2').type(pageName);
      cy.screenshot(`${ssPrefix}today-add-page-name`);
      cy.getByTestid('btn-create-memo').click();
    });


    cy.getByTestid('page-editor').should('be.visible');

    cy.get('.CodeMirror textarea').type(textContent, {force: true});
    cy.screenshot(`${ssPrefix}today-add-text-content`, {capture: 'viewport'});
    cy.get('.grw-grant-selector > .dropup > button.dropdown-toggle').click();
    cy.screenshot(`${ssPrefix}today-select-grant-options`, {capture: 'viewport'});
    cy.get('.btn-submit').eq(0).click();

    cy.get('body').should('not.have.class', 'on-edit');
    cy.screenshot(`${ssPrefix}today-save`);

    cy.visit('/');
    cy.screenshot(`${ssPrefix}today-return-home`);
  });

  it('Successfully create page under specific path', () => {
    const pageName = 'testtest';
    const textContent = '# TEST \n ## Test \n ### test'
    cy.visit('/');

    cy.getByTestid('newPageBtn').click();
    cy.screenshot(`${ssPrefix}under-path-click-new-page`, {capture: 'viewport'});

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').type(pageName);
      cy.screenshot(`${ssPrefix}under-path-add-page-name`);
      cy.getByTestid('btn-create-page-under-below').click();
    });

    cy.getByTestid('page-editor').should('be.visible');

    cy.get('.CodeMirror textarea').type(textContent, {force: true});
    cy.screenshot(`${ssPrefix}under-path-add-text-content`, {capture: 'viewport'});
    cy.get('.grw-grant-selector > .dropup > button.dropdown-toggle').click();
    cy.screenshot(`${ssPrefix}under-path-select-grant-options`, {capture: 'viewport'});
    cy.get('.btn-submit').eq(0).click();

    cy.get('body').should('not.have.class', 'on-edit');
    cy.screenshot(`${ssPrefix}under-path-save`);

    cy.visit('/');
    cy.screenshot(`${ssPrefix}under-path-return-home`);
  });

  it('Successfully create a template page under the path', () => {
    const templatePath = 'testttttt';
    cy.visit('/');

    cy.getByTestid('newPageBtn').click();
    cy.screenshot(`${ssPrefix}create-template-click-new-page`, {capture: 'viewport'});

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
});
