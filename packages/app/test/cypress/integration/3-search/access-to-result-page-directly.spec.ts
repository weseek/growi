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
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  beforeEach(() => {
    if (connectSid != null) {
      cy.setCookie('connect.sid', connectSid);
    }
  });

  it('/_search with "q" param is successfully loaded', () => {
    cy.visit('/_search', { qs: { q: 'Bootstrap4 Tips -Diagrams -Math' } });

    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');

    cy.screenshot(`${ssPrefix}-with-q`);
  });

  it('checkboxes behaviors', () => {
    cy.visit('/_search', { qs: { q: 'Bootstrap4 Tips -Diagrams -Math' } });

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');

    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-first-checkbox-on`);
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-first-checkbox-off`);

    // click select all checkbox
    cy.getByTestid('cb-select-all').click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-1`);
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-2`);
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-3`);
    cy.getByTestid('cb-select-all').click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-4`);
  });

});
