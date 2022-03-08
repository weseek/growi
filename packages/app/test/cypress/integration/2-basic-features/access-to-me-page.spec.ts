context('Access to /me page', () => {
  const ssPrefix = 'access-to-me-page-';

  let connectSid: string | undefined;

  before(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    cy.getCookie('connect.sid').then(cookie => {
      connectSid = cookie?.value;
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  beforeEach(() => {
    if (connectSid != null) {
      cy.setCookie('connect.sid', connectSid);
    }
  });

  it('/me is successfully loaded', () => {
    cy.visit('/me', {  });
    cy.screenshot(`${ssPrefix}-me`);
  });

  it('Draft page is successfully shown', () => {
    cy.visit('/me/drafts');
    cy.screenshot(`${ssPrefix}-draft-page`);
  });

});
