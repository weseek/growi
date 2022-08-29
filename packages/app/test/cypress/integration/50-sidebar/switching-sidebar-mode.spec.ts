context('Switch sidebar mode', () => {
  const ssPrefix = 'switch-sidebar-mode-';

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

  it('Switching sidebar mode', () => {
    cy.visit('/');
    cy.get('.grw-apperance-mode-dropdown').click();

    cy.get('[for="swSidebarMode"]').click({force: true});
    cy.screenshot(`${ssPrefix}-switch-sidebar-mode`, { capture: 'viewport' });

    cy.get('[for="swSidebarMode"]').click({force: true});
    cy.screenshot(`${ssPrefix}-switch-sidebar-mode-back`, { capture: 'viewport' });
  });

});

