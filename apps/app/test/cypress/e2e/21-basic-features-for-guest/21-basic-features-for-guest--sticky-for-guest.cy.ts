context('Access sticky sub navigation switcher and Fab for guest', () => {
  const ssPrefix = 'access-sticky-by-guest-';
  it('Sub navigation sticky changes when scrolling down and up', () => {
    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true, true);

    // Sticky
    cy.waitUntil(() => {
      // do
      // Scroll page down 250px
      cy.scrollTo(0, 250);
      // wait until
      return cy.getByTestid('grw-subnav-switcher').then($elem => !$elem.hasClass('grw-subnav-switcher-hidden'));
    });
    cy.screenshot(`${ssPrefix}subnav-switcher-is-sticky-on-scroll-down`);

    // Not sticky
    cy.waitUntil(() => {
      // do
      // Scroll page to top
      cy.scrollTo(0, 0);
      // wait until
      return cy.getByTestid('grw-subnav-switcher').then($elem => $elem.hasClass('grw-subnav-switcher-hidden'));
    });
    cy.screenshot(`${ssPrefix}subnav-switcher-is-not-sticky-on-scroll-top`);
  });

  it('Fab display changes when scrolling down and up', () => {
    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true, true);

    // Visible
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
       cy.scrollTo(0, 250);

      // wait until
      return cy.getByTestid('grw-fab-return-to-top').then($elem => $elem.hasClass('visible'));

    });
    cy.screenshot(`${ssPrefix}fab-is-visible-on-scroll-down`);

    // Invisible
    cy.waitUntil(() => {
      // do
      // Scroll page to top
       cy.scrollTo(0, 0);

       // wait until
      return cy.getByTestid('grw-fab-return-to-top').then($elem => $elem.hasClass('invisible'));
    });
    cy.screenshot(`${ssPrefix}fab-is-invisible-on-scroll-top`);

  });
});
