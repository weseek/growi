/* eslint-disable cypress/no-unnecessary-waiting */
context('Switch dark mode', () => {
  const ssPrefix = 'switch-dark-mode-';

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

  it('Switching dark mode', () => {
    cy.visit('/');
    cy.get('.grw-personal-dropdown').click();

    cy.get('[for="cbFollowOs"]').click();
    cy.screenshot(`${ssPrefix}-switch-by-os`, { capture: 'viewport' });

    cy.get('[for="swUserPreference"]').click();
    cy.screenshot(`${ssPrefix}-switch-by-user-preference`, { capture: 'viewport' });

    cy.get('[for="swUserPreference"]').click();
    cy.get('[for="cbFollowOs"]').click();
    cy.screenshot(`${ssPrefix}-switch-back-to-default`, { capture: 'viewport' });
  });

});
