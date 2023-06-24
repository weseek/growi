// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import 'cypress-wait-until';

function isVisible($elem: JQuery<Element>) {
  return $elem.is(':visible');
}
function isHidden($elem: JQuery<Element>) {
  return !isVisible($elem);
}
function isVisibleByTestId(testId: string) {
  return isVisible(Cypress.$(`[data-testid=${testId}]`));
}
function isHiddenByTestId(testId: string) {
  return !isVisibleByTestId(testId);
}

Cypress.Commands.add('getByTestid', (selector, options?) => {
  return cy.get(`[data-testid=${selector}]`, options);
});

Cypress.Commands.add('login', (username, password) => {
  cy.session(username, () => {
    cy.visit('/page-to-return-after-login');
    cy.getByTestid('tiUsernameForLogin').type(username);
    cy.getByTestid('tiPasswordForLogin').type(password);

    cy.intercept('POST', '/_api/v3/login').as('login');
    cy.getByTestid('btnSubmitForLogin').click();
    cy.wait('@login')
  });
});

Cypress.Commands.add('waitUntilSkeletonDisappear', () => {
  if (isHidden(Cypress.$('.grw-skeleton'))) {
    return;
  }
  cy.get('.grw-skeleton').should('not.exist');
});

Cypress.Commands.add('waitUntilSpinnerDisappear', () => {
  if (isHidden(Cypress.$('.fa-spinner'))) {
    return;
  }
  cy.get('.fa-spinner').should('not.exist');
});

Cypress.Commands.add('collapseSidebar', (isCollapsed: boolean, waitUntilSaving = false) => {
  cy.getByTestid('grw-sidebar-wrapper', { timeout: 5000 }).within(() => {
    // skip if .grw-sidebar-dock does not exist
    if (isHidden(Cypress.$('.grw-sidebar-dock'))) {
      return;
    }

    // process only when Dock Mode
    cy.get('.grw-sidebar-dock').within(() => {
      const isSidebarContextualNavigationHidden = isHiddenByTestId('grw-contextual-navigation-sub');
      if (isSidebarContextualNavigationHidden === isCollapsed) {
        return;
      }

      cy.waitUntil(() => {
        // do
        cy.getByTestid("grw-navigation-resize-button").click({force: true});
        // wait until saving UserUISettings
        if (waitUntilSaving) {
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(1500);
        }

        // wait until
        return cy.getByTestid('grw-contextual-navigation-sub').then($contents => isHidden($contents) === isCollapsed);
      });
    });
  });
});
