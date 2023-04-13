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
    cy.collapseSidebar(true);
  });

  it('Fab is displayed on scroll down', () => {
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
       cy.scrollTo(0, 250);
      // wait until
      return cy.getByTestid('grw-fab-container').within(() => {
        return cy.getByTestid('grw-fab-page-create-button').then($elem => $elem.hasClass('visible'));
      });
    });

    cy.screenshot(`${ssPrefix}is-sticky-on-scroll-down`);
  });

  it('Fab is invisible on scroll top', () => {
    cy.waitUntil(() => {
      //do
      // Scroll the window back to top
      cy.scrollTo(0, 0);
      // wait until
      return cy.getByTestid('grw-fab-container').within(() => {
        return cy.getByTestid('grw-fab-page-create-button').then($elem => $elem.hasClass('invisible'));
      });
    });

    cy.screenshot(`${ssPrefix}is-invisible-on-scroll-top`);
  });

  it('Fab is not displayed when move to other pages', () => {
    // Move to /Sandbox page
    cy.visit('/Sandbox');

    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true);


    cy.screenshot(`${ssPrefix}is-not-visible-on-move-to-other-pages`);
  });

  it('Able to open create page modal from fab', () => {
    cy.waitUntil(() => {
      //do
      // Scroll the window back to top
      cy.scrollTo(0, 250);
      // wait until
      return cy.getByTestid('grw-fab-container').within(() => {
        return cy.getByTestid('grw-fab-page-create-button').then($elem => $elem.hasClass('visible'));
      });
    });
    cy.waitUntil(() => {
      //do
      cy.getByTestid('grw-fab-page-create-button').click();
      // wait until
      return cy.getByTestid('page-create-modal').then($elem => $elem.is(':visible'));
    });

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}new-page-modal-opened-from-fab`);
      cy.get('button.close').click();
    });
  });

  it('Able to scroll page to top', () => {
    cy.getByTestid('grw-fab-container').within(() => {
       cy.getByTestid('grw-fab-return-to-top').should('have.class', 'visible');
    });

    cy.waitUntil(() => {
      //do
      cy.getByTestid('grw-fab-return-to-top').click();
      // wait until
      return cy.getByTestid('grw-fab-return-to-top').then($elem => $elem.hasClass('invisible'));
    });

    cy.screenshot(`${ssPrefix}scroll-page-to-top`);
  });
});
