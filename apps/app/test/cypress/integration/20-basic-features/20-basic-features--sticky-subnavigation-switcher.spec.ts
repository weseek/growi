context('Access to sticky sub navigation switcher ', () => {
  const ssPrefix = 'subnav-switcher-';

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

  it('Sub navigation sticky changes when scrolling down and up', () => {
    // Sticky
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
      cy.scrollTo(0, 250);

      // wait until
      return cy.getByTestid('grw-subnav-switcher').then($elem => !$elem.hasClass('grw-subnav-switcher-hidden'));
    });
    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}is-sticky-on-scroll-down`);

    // Not sticky
    cy.waitUntil(() => {
      // do
      // Scroll page to top
      cy.scrollTo(0, 0);

      // wait until
      return cy.getByTestid('grw-subnav-switcher').then($elem => $elem.hasClass('grw-subnav-switcher-hidden'));
    });
    cy.screenshot(`${ssPrefix}is-not-sticky-on-scroll-top`);
  });

  it('Sub navigation is not sticky when move to other pages', () => {
    // Make the sub navigation sticky
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
      cy.scrollTo(0, 250);

      // wait until
      return cy.getByTestid('grw-subnav-switcher').then($elem => !$elem.hasClass('grw-subnav-switcher-hidden'));
    });

    // Move to /Sandbox page
    cy.visit('/Sandbox');

    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true);

    cy.getByTestid('grw-subnav-switcher').then($elem => $elem.hasClass('grw-subnav-switcher-hidden'))
    cy.screenshot(`${ssPrefix}is-not-sticky-on-move-to-other-pages`);
  });

  it('Able to click buttons on sub navigation switcher when sticky', () => {
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
      cy.scrollTo(0, 250);

      // wait until
      return cy.getByTestid('grw-subnav-switcher').then($elem => !$elem.hasClass('grw-subnav-switcher-hidden'));
    });
    cy.waitUntil(() => {
      cy.getByTestid('grw-subnav-switcher').within(() => {
        cy.getByTestid('editor-button').should('be.visible').click();
      });
      return cy.get('.layout-root').then($elem => $elem.hasClass('editing'));
    });
    cy.get('.grw-editor-navbar-bottom').should('be.visible');
    cy.screenshot(`${ssPrefix}open-editor-when-sticky`);
  });

  it('Sub navigation is sticky when on small window', () => {
    cy.waitUntil(() => {
      // do
      // Scroll the window 500px down
      cy.scrollTo(0, 500);

      // wait until
      return cy.getByTestid('grw-subnav-switcher').then($elem => !$elem.hasClass('grw-subnav-switcher-hidden'));
    });
    cy.viewport(600, 1024);
    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}is-sticky-on-small-window`);
  });
});
