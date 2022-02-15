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
     // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.screenshot(`${ssPrefix}-open-page-create-modal`,{ capture: 'viewport' });
    cy.getByTestid('createPageBtn').click();
    cy.screenshot(`${ssPrefix}-create-clicked`, {capture: 'viewport'});
  });

});
