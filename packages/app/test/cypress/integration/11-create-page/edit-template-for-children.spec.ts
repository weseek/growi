/* eslint-disable cypress/no-unnecessary-waiting */
context('Edit template for children', () => {
  const ssPrefix = 'edit-template-for-children-';

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
    cy.get('#template-type').click();
    cy.get('#template-type').next().find('button:eq(0)').click();
    cy.get('#dd-template-type').next().find('button').click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-1-editor`, { capture: 'viewport' });
    cy.get('.btn-submit').eq(0).click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-2-saved`, { capture: 'viewport' });
  });

});
