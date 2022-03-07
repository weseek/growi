/* eslint-disable cypress/no-unnecessary-waiting */
context('Confirm notification', () => {
  const ssPrefix = 'confirm-notification-';

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

  it('Confirm notification', () => {
    cy.visit('/');
    cy.get('.notification-wrapper > a').click();
    cy.get('.notification-wrapper > .dropdown-menu > a').click();

    cy.wait(1500);

    cy.screenshot(`${ssPrefix}-see-all`, { capture: 'viewport' });

    cy.get('#all-in-app-notifications ul.nav-title li:eq(1) a').click();

    cy.wait(500);

    cy.screenshot(`${ssPrefix}-see-unread`, { capture: 'viewport' });
  });

});
