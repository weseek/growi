context('Create page modal', () => {

  const ssPrefix = 'create-page';

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

  it("Page create modal is shown successfully", () => {
    cy.getByTestid('newPageBtn').click();
    cy.screenshot(`${ssPrefix}-opne-modal at '/' page`)
  });

  it("Page create modal is shown successfully at /Sandbox page", ()=>{
    cy.visit('/Sandbox');
    cy.getByTestid('newPageBtn').click();
    cy.screenshot(`${ssPrefix}-open-modal-at /Sandbox`)
  });

});
