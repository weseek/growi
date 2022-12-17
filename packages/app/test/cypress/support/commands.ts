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

/**
 * use only for the pages which use component with skeleton
 */
Cypress.Commands.add('waitUntilSkeletonDisappear', () => {
  cy.get('.grw-skeleton').should('exist');
  cy.get('.grw-skeleton').should('not.exist');
});

Cypress.Commands.add('waitUntilSpinnerDisappear', () => {
  cy.get('.fa-spinner').should('exist');
  cy.get('.fa-spinner').should('not.exist');
});

Cypress.Commands.add('collapseSidebar', (isCollapsed: boolean) => {
  cy.waitUntil(() => {
    // do
    cy.getByTestid("grw-navigation-resize-button").click({force: true});
    // wait until
    return cy.getByTestid('grw-contextual-navigation-sub').then(($elem) => {
      const isVisible = $elem.is(':visible');
      return isVisible !== isCollapsed;
    });
  });
});
