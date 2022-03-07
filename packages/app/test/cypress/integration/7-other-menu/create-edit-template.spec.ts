/* eslint-disable cypress/no-unnecessary-waiting */
context('Create - Edit Template Page', () => {
  const ssPrefix = 'create-edit-template-';

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

    cy.visit('/Sandbox/Math');
    cy.get('#grw-subnav-container .grw-btn-page-management').click();
    cy.get('#grw-subnav-container .dropdown-menu-right > button:eq(4)').click();
    cy.wait(500);
  });

  it('Create edit template for children', () => {
    cy.screenshot(`${ssPrefix}-modal-popup`, { capture: 'viewport' });
    cy.get('.card-deck > .card:eq(0) .card-footer > a').click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-edit-template-for-children`, { capture: 'viewport' });
  });

  it('Create edit template for descendants', () => {
    cy.screenshot(`${ssPrefix}-modal-popup`, { capture: 'viewport' });
    cy.get('.card-deck > .card:eq(1) .card-footer > a').click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-edit-template-for-descendants`, { capture: 'viewport' });
  });

});
