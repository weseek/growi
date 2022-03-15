/* eslint-disable cypress/no-unnecessary-waiting */
context('Create page below', () => {
  const ssPrefix = 'create-page-below-';

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

  it('Create page below', () => {
    cy.visit('/Sandbox/Math');
    cy.getByTestid('newPageBtn').click();
    const randomInt = Math.floor(Math.random() * 99999);
    cy.get('[name="new_path"]').type('create-test-'+randomInt);
    cy.getByTestid('btn-create-page-under-below').click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-1-editor`, { capture: 'viewport' });
    cy.get('.btn-submit').eq(0).click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-2-saved`, { capture: 'viewport' });
  });

});
