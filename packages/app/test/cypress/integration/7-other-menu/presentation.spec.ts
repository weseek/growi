/* eslint-disable cypress/no-unnecessary-waiting */
context('Presentation Page', () => {
  const ssPrefix = 'presentation-page-';

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
    cy.get('#grw-subnav-container .dropdown-menu-right > button:eq(2)').click();
    cy.screenshot(`${ssPrefix}-presentation-page`, { capture: 'viewport' });
    // cy.get('body').click(1,1); // Click outside to close presentation
  });

});
