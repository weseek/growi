context('Access to search result page directly', () => {
  const ssPrefix = 'access-to-result-page-directly-';

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

  it('/_search with "q" param is successfully loaded', () => {
    cy.visit('/_search', { qs: { q: 'sandbox headers blockquotes' } });
    cy.screenshot(`${ssPrefix}-with-q`, { capture: 'viewport' });
  });

});
