context('Access to sticky Fab', () => {
  const ssPrefix = 'fab-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });

    // Visit /
    cy.visit('/');

    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true, true);
  });

  it('Fab display changes on scroll down and up', () => {

    // Visible
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
       cy.scrollTo(0, 250);
      // wait until
      return cy.getByTestid('grw-fab-page-create-button').then($elem => $elem.hasClass('visible'));
    });
    cy.screenshot(`${ssPrefix}is-visible-on-scroll-down`);

    // Invisible
    cy.waitUntil(() => {
      //do
      // Scroll the window back to top
      cy.scrollTo(0, 0);
      // wait until
      return cy.getByTestid('grw-fab-page-create-button').then($elem => $elem.hasClass('invisible'));
    });
    cy.screenshot(`${ssPrefix}is-invisible-on-scroll-top`);
  });

  it('Fab is not displayed when move to other pages', () => {

    // Initial scroll down
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
       cy.scrollTo(0, 250);
      // wait until
        return cy.getByTestid('grw-fab-page-create-button').then($elem => $elem.hasClass('visible'));
    });

    // Move to /Sandbox page
    cy.visit('/Sandbox');

    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true);

    cy.waitUntil(() => cy.getByTestid('grw-fab-page-create-button').then($elem => $elem.hasClass('invisible')));
    cy.screenshot(`${ssPrefix}is-not-visible-on-move-to-other-pages`);
  });

  it('Able to open create page modal from fab', () => {
    cy.waitUntil(() => {
      //do
      // Scroll the window back to top
      cy.scrollTo(0, 250);

      // wait until
      return cy.getByTestid('grw-fab-page-create-button')
      .should('have.class', 'visible')
      .within(() => {
        cy.get('.btn-create-page').click();
        return true;
      });
    });

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}new-page-modal-opened-from-fab`);
      cy.get('button.close').click();
    });
  });

  it('Able to scroll page to top', () => {

    // Initial scroll down
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
      cy.scrollTo(0, 250);

      // wait until
      return cy.getByTestid('grw-fab-return-to-top')
        .should('have.class', 'visible')
        .then(() => {
          cy.waitUntil(() => {
            cy.get('.btn-scroll-to-top').click();
            return cy.getByTestid('grw-fab-return-to-top').should('have.class', 'invisible');
          });
        });
    });

    cy.screenshot(`${ssPrefix}scroll-page-to-top`);
  });
});
