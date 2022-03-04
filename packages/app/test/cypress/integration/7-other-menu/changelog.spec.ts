/* eslint-disable cypress/no-unnecessary-waiting */
context('Change Log', () => {
  const ssPrefix = 'changelog-';

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

  it('Changelog Page', () => {
    cy.visit('/Sandbox/Math');
    cy.get('#shareLink-btn-wrapper-for-tooltip-for-pageHistory button').click();
    cy.wait(500);
    cy.get('.revision-history tr:eq(0) .btn-group button:eq(0)').click(); // Compare with the latest
    cy.screenshot(`${ssPrefix}-compare-with-latest`, { capture: 'viewport' });
    cy.get('.revision-history tr:eq(0) .btn-group button:eq(1)').click(); // Compare with the previous version
    cy.screenshot(`${ssPrefix}-compare-with-previous`, { capture: 'viewport' });
    cy.get('.revision-history tr:eq(0) .revision-history-main .mb-1 a').click(); // View this version
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-view-this-version`, { capture: 'viewport' });
  });

});
