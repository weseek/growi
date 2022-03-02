/* eslint-disable cypress/no-unnecessary-waiting */
context('Duplicate page', () => {
  const ssPrefix = 'duplicate-page-';

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

  it('Duplicate Page', () => {
    cy.visit('/Sandbox/Math');
    cy.get('#grw-subnav-container .grw-btn-page-management').click();
    cy.get('#grw-subnav-container .dropdown-menu-right > button:eq(1)').click();
    cy.wait(300);
    cy.get('.search-clear').click();

    const randomInteger = () => Cypress._.random(0, 1e6)
    cy.get('[name="new_path"]').type(`/test${randomInteger}`);
    cy.get('.modal-footer .btn-primary').click();

    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-duplicate-page`, { capture: 'viewport' });
  });

});
