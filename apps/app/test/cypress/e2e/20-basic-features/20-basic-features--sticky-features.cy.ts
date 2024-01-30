context('Access to any page', () => {
  const ssPrefix = 'subnav-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });

    cy.visit('/');

    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true, true);
  });

  it('Subnavigation displays changes on scroll down and up', () => {
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
       cy.scrollTo(0, 250);
      // wait until
      return cy.get('.sticky-outer-wrapper').should('have.class', 'active');
    });

    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}visible-on-scroll-down`);

    cy.waitUntil(() => {
      // do
      // Scroll the window back to top
      cy.scrollTo(0, 0);
      // wait until
      return cy.get('.sticky-outer-wrapper').should('not.have.class', 'active');
    });

    cy.screenshot(`${ssPrefix}invisible-on-scroll-top`);
  });

  it('Subnavigation is not displayed when move to other pages', () => {
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
      cy.scrollTo(0, 250);
      // wait until
      return cy.get('.sticky-outer-wrapper').should('have.class', 'active');
    });

    // Move to /Sandbox page
    cy.visit('/Sandbox');

    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true);

    return cy.get('.sticky-outer-wrapper').should('not.have.class', 'active');
    cy.screenshot(`${ssPrefix}not-visible-on-move-to-other-pages`);
  });

  it('Able to click buttons on subnavigation switcher when sticky', () => {
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
      cy.scrollTo(0, 250);
      // wait until
      return cy.get('.sticky-outer-wrapper').should('have.class', 'active');
    });
    cy.waitUntil(() => {
      cy.getByTestid('grw-contextual-sub-nav').within(() => {
        cy.getByTestid('editor-button').as('editorButton').should('be.visible');
        cy.get('@editorButton').click();
      });
      return cy.get('.layout-root').then($elem => $elem.hasClass('editing'));
    });
    cy.getByTestid('grw-editor-navbar-bottom').should('be.visible');
    // cy.get('.CodeMirror').should('be.visible');
    cy.screenshot(`${ssPrefix}open-editor-when-sticky`);
  });

  it('Subnavigation is sticky when on small window', () => {
    cy.waitUntil(() => {
      // do
      // Scroll the window 500px down
      cy.scrollTo(0, 500);
      // wait until
      return cy.get('.sticky-outer-wrapper').should('have.class', 'active');
    });
    cy.waitUntilSkeletonDisappear();
    cy.viewport(600, 1024);
    cy.getByTestid('grw-contextual-sub-nav').within(() => {
      cy.get('#grw-page-editor-mode-manager').should('be.visible');
    })
    cy.screenshot(`${ssPrefix}sticky-on-small-window`);
  });
});
