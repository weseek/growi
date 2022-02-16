
context('Access to special pages', () => {
  const ssPrefix = 'access-to-special-pages-';

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

  it('/trash is successfully loaded', () => {
    cy.visit('/trash', {  });
    cy.getByTestid('trash-page-list').should('be.visible');
    cy.screenshot(`${ssPrefix}-trash`, { capture: 'viewport' });
  });

  it('/tags is successfully loaded', () => {
    cy.visit('/tags');
    cy.getByTestid('tags-page').should('be.visible');
    cy.screenshot(`${ssPrefix}-tags`, { capture: 'viewport' });
  });

});
