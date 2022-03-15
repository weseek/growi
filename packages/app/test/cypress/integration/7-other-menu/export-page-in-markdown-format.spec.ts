/* eslint-disable cypress/no-unnecessary-waiting */
context('Export page in markdown format', () => {
  const ssPrefix = 'export-to-markdown-';

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
    }
  });

  it('Presentation Page', () => {
    cy.visit('/Sandbox/Math');
    cy.getByTestid('open-page-item-control-btn').eq(0).click();
    cy.getByTestid('open-page-item-control-btn').eq(0).find('.dropdown-menu > button:eq(3)');
  });

});
