/* eslint-disable cypress/no-unnecessary-waiting */
context('Access User settings', () => {
  const ssPrefix = 'access-user-settings-';

  let connectSid: string | undefined;

  before(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    cy.getCookie('connect.sid').then(cookie => {
      connectSid = cookie?.value;
    });

    cy.visit('/');
    cy.get('.grw-personal-dropdown').click();
    cy.get('[href="/me"]').click();

    cy.wait(1500);
  });

  beforeEach(() => {
    if (connectSid != null) {
      cy.setCookie('connect.sid', connectSid);
    }
  });

  it('Update settings', () => {
    // Access User information
    cy.get('#personal-setting .tab-pane.active > div:first button').click(); // Click basic info update button

    cy.wait(500);

    cy.screenshot(`${ssPrefix}-user-information`, { capture: 'viewport' });
    cy.get('.toast-close-button').click({ multiple: true }); // close toast alert

    // Access External account
    cy.get('#personal-setting .nav-title.nav li:eq(1) a').click(); // click
    cy.get('#personal-setting .tab-pane.active h2 button').click(); // click add button
    cy.get('.modal-footer button').click(); // click add button in modal form
    cy.get('.close[aria-label="Close"]').click(); // close modal form

    cy.wait(500);

    cy.screenshot(`${ssPrefix}-external-account`, { capture: 'viewport' });
    cy.get('.toast-close-button').click({ multiple: true }); // close toast alert

    // Access Password setting
    cy.get('#personal-setting .nav-title.nav li:eq(2) a').click();
    cy.get('#personal-setting .tab-pane.active button').click(); // click update button

    cy.wait(500);

    cy.screenshot(`${ssPrefix}-password-setting`, { capture: 'viewport' });
    cy.get('.toast-close-button').click({ multiple: true }); // close toast alert

    // Access API setting
    cy.get('#personal-setting .nav-title.nav li:eq(2) a').click();
    cy.get('#personal-setting .tab-pane.active button').click(); // click update API token button

    cy.wait(500);

    cy.screenshot(`${ssPrefix}-api-setting`, { capture: 'viewport' });
    cy.get('.toast-close-button').click({ multiple: true }); // close toast alert

    // Access Editor setting
    cy.get('#personal-setting .nav-title.nav li:eq(3) a').click();
    cy.get('#personal-setting .tab-pane.active button').click(); // click update button

    cy.wait(500);

    cy.screenshot(`${ssPrefix}-editor-setting`, { capture: 'viewport' });
    cy.get('.toast-close-button').click({ multiple: true }); // close toast alert

    // Access In-app notification setting
    cy.get('#personal-setting .nav-title.nav li:eq(4) a').click();
    cy.get('#personal-setting .tab-pane.active button').click(); // click update button

    cy.wait(500);

    cy.screenshot(`${ssPrefix}-in-app-notification-setting`, { capture: 'viewport' });
  });

});
