/* eslint-disable cypress/no-unnecessary-waiting */
context('Access Home', () => {
  const ssPrefix = 'access-home-';

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

  it('Visit home', () => {
    cy.visit('/');
    cy.get('.grw-personal-dropdown').click();
    cy.get('.grw-personal-dropdown .dropdown-menu .btn-group > .btn-outline-secondary:eq(0)').click();

    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-visit-home`, { capture: 'viewport' });
  });

});
