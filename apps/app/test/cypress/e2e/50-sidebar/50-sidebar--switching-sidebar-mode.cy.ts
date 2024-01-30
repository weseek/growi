import { BlackoutGroup } from "../../support/blackout";

// Blackout for recalculation of toc content hight
const blackoutOverride = [
  ...BlackoutGroup.BASIS,
  ...BlackoutGroup.SIDE_CONTENTS,
];

context('Switch sidebar mode', () => {
  const ssPrefix = 'switch-sidebar-mode-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    cy.visit('/');
  });

  it('Switching sidebar mode', () => {
    cy.collapseSidebar(false);
    cy.screenshot(`${ssPrefix}-doc-mode-opened`, {
      blackout: blackoutOverride,
    });

    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-doc-mode-closed`, {
      blackout: blackoutOverride,
    });
  });

});

context('Switch viewport size', () => {
  const ssPrefix = 'switch-viewport-size-';

  const sizes = {
    'xl': [1200, 1024],
    'lg': [992, 1024],
    'md': [768, 1024],
    'sm': [576, 1024],
    'xs': [575, 1024],
    'iphone-x': [375, 812],
  };

  Object.entries(sizes).forEach(([screenLabel, size]) => {
    it(`on ${screenLabel} screen`, () => {
      cy.viewport(size[0], size[1]);

      // login
      cy.fixture("user-admin.json").then(user => {
        cy.login(user.username, user.password);
      });
      cy.visit('/');

      cy.get('.layout-root').should('be.visible');

      cy.screenshot(`${ssPrefix}-${screenLabel}`, {
        blackout: blackoutOverride,
      });
    });
  });

});

