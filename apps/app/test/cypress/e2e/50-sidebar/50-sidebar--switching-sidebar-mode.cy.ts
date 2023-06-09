import { BlackoutGroup } from "../../support/blackout";

// Blackout for recalculation of toc content hight
const blackoutOverride = [
  ...BlackoutGroup.BASIS,
  ...BlackoutGroup.SIDE_CONTENTS,
];

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
    // This test uses collapseSidebar here, because this test for the sidebar.
    cy.collapseSidebar(true)
    cy.get('.grw-apperance-mode-dropdown').first().click();

    cy.get('[for="swSidebarMode"]').click({force: true});
    cy.get('.grw-sidebar-nav').should('not.be.visible');
    cy.screenshot(`${ssPrefix}-switch-sidebar-mode`, {
      blackout: blackoutOverride,
    });

    cy.get('[for="swSidebarMode"]').click({force: true});
    cy.get('.grw-sidebar-nav').should('be.visible');
    cy.screenshot(`${ssPrefix}-switch-sidebar-mode-back`, {
      blackout: blackoutOverride,
    });
  });

});
