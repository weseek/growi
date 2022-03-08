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
    cy.getByTestid('grw-sidebar-nav-primary-page-tree').click();
    cy.screenshot(`${ssPrefix}-pagetree-before-load`, { capture: 'viewport' });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-pagetree-after-load`, { capture: 'viewport' });
  });

});
