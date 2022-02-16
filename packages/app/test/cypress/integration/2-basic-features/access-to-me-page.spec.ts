const ssPrefix = 'access-to-page-';

context('Access to page', () => {

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

  it('/me is successfully loaded', () => {
    cy.visit('/me', {  });
    cy.screenshot(`${ssPrefix}-me`, { capture: 'viewport' });
  });

  it('Draft page is successfully shown', () => {
    cy.visit('/me/drafts');
    cy.screenshot(`${ssPrefix}-draft-page`, { capture: 'viewport' });
  });

});
