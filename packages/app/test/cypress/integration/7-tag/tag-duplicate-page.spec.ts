/* eslint-disable cypress/no-unnecessary-waiting */
context('Duplicate page by generated tag', () => {
  const ssPrefix = 'duplicate-tag-';

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

  it('Duplicate page by generated tag', () => {
    const tag = 'we';
    cy.visit('/');
    cy.screenshot(`${ssPrefix}visit-home`, {capture: 'viewport'});

    cy.get('#grw-subnav-container').within(()=>{
      cy.get('a[href*="/_search?q=tag"]').contains(tag).click()
    });
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}click-tag-name`, {capture: 'viewport'});
  });

});
