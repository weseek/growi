// from https://github.com/cypress-io/cypress/issues/877#issuecomment-538708750
const isInViewport = (_chai) => {
  function assertIsInViewport() {

    const subject = this._obj;

    const bottom = Cypress.config("viewportWidth");
    const rect = subject[0].getBoundingClientRect();

    this.assert(
      rect.top < bottom && rect.bottom < bottom,
      "expected #{this} to be in viewport",
      "expected #{this} to not be in viewport",
      this._obj
    )
  }

  _chai.Assertion.addMethod('inViewport', assertIsInViewport)
};

chai.use(isInViewport);
