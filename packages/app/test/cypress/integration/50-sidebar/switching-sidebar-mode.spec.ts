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
    cy.get('.grw-personal-dropdown').first().click();

    cy.get('[for="swSidebarMode"]').click({force: true});
    cy.screenshot(`${ssPrefix}-switch-sidebar-mode`, {
      blackout: ['#revision-toc'],
    })

    cy.get('[for="swSidebarMode"]').click({force: true});
    cy.screenshot(`${ssPrefix}-switch-sidebar-mode-back`, {
      blackout: ['#revision-toc'],
    })
  });

});
