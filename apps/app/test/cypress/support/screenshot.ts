import { BlackoutGroup } from "./blackout";

Cypress.Screenshot.defaults({
  blackout: [
    ...BlackoutGroup.BASIS,
    ...BlackoutGroup.SIDEBAR_NAV,
  ],
  capture: 'viewport',
})
