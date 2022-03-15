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
    cy.getByTestid('open-page-item-control-btn').eq(0).click();
    cy.getByTestid('open-page-item-control-btn').eq(0).find('.dropdown-menu > button:eq(7)').click();
    cy.wait(500);
  });


  it('Create edit template for children', () => {
    cy.screenshot(`${ssPrefix}-1-modal-popup`, { capture: 'viewport' });
    cy.get('.card-deck > .card:eq(0) .card-footer > a').click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-2-edit-template-for-children`, { capture: 'viewport' });
    cy.get('#caret').click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-3-edit-template-finished`, { capture: 'viewport' });
  });

  it('Create edit template for descendants', () => {
    cy.get('.card-deck > .card:eq(1) .card-footer > a').click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-4-edit-template-for-descendants`, { capture: 'viewport' });
    cy.get('#caret').click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-5-edit-template-for-descendants-finished`, { capture: 'viewport' });
  });

});
