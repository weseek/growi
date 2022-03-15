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
    cy.getByTestid('open-page-item-control-btn').eq(0).click();
    cy.getByTestid('open-page-item-control-btn').eq(0).find('.dropdown-menu > button:eq(0)').click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-1-modal`, { capture: 'viewport' });

    const randomInt = Math.floor(Math.random() * 99999);
    cy.get('[name="new_path"]').type('test ' + randomInt);
    cy.get('.modal-footer .btn-primary').click();

    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-2-layout`, { capture: 'viewport' });
  });

});
