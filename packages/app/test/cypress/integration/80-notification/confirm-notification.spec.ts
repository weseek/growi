/* eslint-disable cypress/no-unnecessary-waiting */
context('Confirm notification', () => {
  const ssPrefix = 'confirm-notification-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('Confirm notification', () => {
    cy.visit('/');
    cy.get('.notification-wrapper > a').click();
    cy.get('.notification-wrapper > .dropdown-menu > a').click();

    cy.get('#all-in-app-notifications').should('be.visible');

    cy.screenshot(`${ssPrefix}-see-all`, { capture: 'viewport' });

    cy.get('#all-in-app-notifications ul.nav-title li:eq(1) a').click();

    cy.get('.tab-pane.active > .justify-content-end > button').should('be.visible');

    cy.screenshot(`${ssPrefix}-see-unread`, { capture: 'viewport' });
  });

});
