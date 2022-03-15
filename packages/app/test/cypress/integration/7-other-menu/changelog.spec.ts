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
    cy.getByTestid('open-page-item-control-btn').eq(0).click();
    cy.getByTestid('open-page-item-control-btn').eq(0).find('.dropdown-menu > button:eq(4)').click();
    cy.wait(1500);
    cy.get('.revision-history-table .d-lg-flex .btn-group button:eq(0)').eq(0).click(); // Compare with the latest
    cy.screenshot(`${ssPrefix}-1-compare-with-latest`, { capture: 'viewport' });
    cy.get('.revision-history-table .d-lg-flex .btn-group button:eq(1)').eq(0).click({force: true}); // Compare with the previous version
    cy.screenshot(`${ssPrefix}-2-compare-with-previous`, { capture: 'viewport' });
    cy.get('.revision-history-table .d-lg-flex .revision-history-main .mb-1 a').eq(0).click(); // View this version
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-3-view-this-version`, { capture: 'viewport' });
  });

});
