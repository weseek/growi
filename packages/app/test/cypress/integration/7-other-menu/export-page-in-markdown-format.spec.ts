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
    cy.get('#grw-subnav-container .grw-btn-page-management').click();
    cy.get('#grw-subnav-container .dropdown-menu-right > button:eq(3)').click();

    // TODO: verify/assert or screenshoot downloaded file
    // cy.screenshot(`${ssPrefix}-export-to-markdown-page`, { capture: 'viewport' });
  });

});
