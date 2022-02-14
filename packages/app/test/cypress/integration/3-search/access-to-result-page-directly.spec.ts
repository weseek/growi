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
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.screenshot(`${ssPrefix}-with-q`, { capture: 'viewport' });
  });

  it('checkboxes behaviors', () => {
    cy.visit('/_search', { qs: { q: 'sandbox headers blockquotes' } });

    cy.get('[data-testid=cbDelete]').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-first-checkbox-on`, { capture: 'viewport' });
    cy.get('[data-testid=cbDelete]').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-first-checkbox-off`, { capture: 'viewport' });
  });

});
