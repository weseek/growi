// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './assertions'
import './commands'
import './screenshot'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Ignore 'ResizeObserver loop limit exceeded' exception
// https://github.com/cypress-io/cypress/issues/8418
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/
Cypress.on('uncaught:exception', (err) => {
    /* returning false here prevents Cypress from failing the test */
    if (resizeObserverLoopErrRe.test(err.message)) {
        return false
    }
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
       getByTestid(selector: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<Element>>,
       login(username: string, password: string): Chainable<void>,
       collapseSidebar(isCollapsed: boolean, waitUntilSaving?: boolean): Chainable<void>,
       isInViewport(selector: string): Chainable<void>,
       waitUntilSkeletonDisappear(): Chainable<void>,
       waitUntilSpinnerDisappear(): Chainable<void>,
    }
  }
}
