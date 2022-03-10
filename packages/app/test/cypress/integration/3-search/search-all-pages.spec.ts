context('Search all pages', () => {
  const ssPrefix = 'search-all-pages-';

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

  it('Search by typing help and press ENTER', () => {
    const searchText = 'help';
    cy.visit('/');
    cy.get('div.rbt-input-hint-container > input').click();
    cy.screenshot(`${ssPrefix}search-input-focused`, { capture: "viewport"});
    cy.get('div.rbt-input-hint-container > input').type(`${searchText}{enter}`);
    cy.screenshot(`${ssPrefix}insert-search-text`, { capture: "viewport"});
    cy.get('div.rbt-input-hint-container > input').type('{enter}');
    cy.screenshot(`${ssPrefix}press-enter`, { capture: "viewport"});
  });

});
