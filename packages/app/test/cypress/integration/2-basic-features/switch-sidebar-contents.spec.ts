context('Access to page', () => {
  const ssPrefix = 'switch-sidebar-content';

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

  it('PageTree is successfully shown', () => {
    cy.visit('/');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.getByTestid('sidebar-pagetree').click();
    cy.screenshot(`${ssPrefix}-pagetree`, { capture: 'viewport' });
  });

});
