context('Open PageCreateModal', () => {

  const ssPrefix = 'open-page-create-modal-';

  let connectSid: string | undefined;

  before(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    cy.getCookie('connect.sid').then(cookie => {
      connectSid = cookie?.value;
    });
  });

  beforeEach(() => {
    if (connectSid != null) {
      cy.setCookie('connect.sid', connectSid);
      cy.visit('/');
    }
  });

  it("PageCreateModal is shown successfully", () => {
    cy.getByTestid('newPageBtn').click();

    cy.getByTestid('page-create-modal').should('be.visible');
    cy.screenshot(`${ssPrefix}-open`,{ capture: 'viewport' });

    cy.getByTestid('row-create-page-under-below').find('input.form-control').clear().type('/new-page');
    cy.getByTestid('btn-create-page-under-below').click();

    cy.getByTestid('page-editor').should('be.visible');
    cy.screenshot(`${ssPrefix}-create-clicked`, {capture: 'viewport'});
  });

});
