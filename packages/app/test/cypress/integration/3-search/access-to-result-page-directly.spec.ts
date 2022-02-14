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

    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-first-checkbox-on`, { capture: 'viewport' });
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-first-checkbox-off`, { capture: 'viewport' });

    // click select all checkbox
    cy.getByTestid('cb-select-all').click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-1`, { capture: 'viewport' });
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-2`, { capture: 'viewport' });
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-3`, { capture: 'viewport' });
    cy.getByTestid('cb-select-all').click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-4`, { capture: 'viewport' });
  });

});
