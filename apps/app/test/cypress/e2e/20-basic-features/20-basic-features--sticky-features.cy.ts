context('Access to any page', () => {
  const ssPrefix = 'subnav-and-fab-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });

    cy.visit('/');

    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true, true);
  });

  it('Subnavigation and fab displays changes on scroll down and up', () => {
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
       cy.scrollTo(0, 250);
      // wait until
      return cy.getByTestid('grw-subnav-switcher').then($elem => !$elem.hasClass('grw-subnav-switcher-hidden'));
    });
    // wait until fab visible
    cy.waitUntil(() => cy.getByTestid('grw-fab-page-create-button').then($elem => $elem.hasClass('visible')));

    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}visible-on-scroll-down`);

    cy.waitUntil(() => {
      // do
      // Scroll the window back to top
      cy.scrollTo(0, 0);
      // wait until
      return cy.waitUntil(() => cy.getByTestid('grw-subnav-switcher').then($elem => $elem.hasClass('grw-subnav-switcher-hidden')));
    });
    // wait until fab invisible
    cy.waitUntil(() => cy.getByTestid('grw-fab-page-create-button').then($elem => $elem.hasClass('invisible')));

    cy.screenshot(`${ssPrefix}invisible-on-scroll-top`);
  });

  it('Subnavigation and fab are not displayed when move to other pages', () => {
    cy.waitUntil(() => {
      // do
      // Scroll the window 250px down is enough to trigger sticky effect
      cy.scrollTo(0, 250);
      // wait until
      return () => cy.getByTestid('grw-subnav-switcher').then($elem => !$elem.hasClass('grw-subnav-switcher-hidden'));
    });
    cy.waitUntil(() => cy.getByTestid('grw-fab-page-create-button').then($elem => $elem.hasClass('visible')));

    // Move to /Sandbox page
    cy.visit('/Sandbox');

    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true);

    cy.waitUntil(() => cy.getByTestid('grw-fab-page-create-button').then($elem => $elem.hasClass('invisible')));
    cy.waitUntil(() => cy.getByTestid('grw-subnav-switcher').then($elem => $elem.hasClass('grw-subnav-switcher-hidden')));
    cy.screenshot(`${ssPrefix}not-visible-on-move-to-other-pages`);
  });

  it('Able to open create page modal from fab', () => {
    cy.waitUntil(() => {
      // do
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

  it('Able to scroll page to top from fab', () => {
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
    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}scroll-page-to-top`);
  });

  it('Able to click buttons on subnavigation switcher when sticky', () => {
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
    cy.get('.CodeMirror').should('be.visible');
    cy.screenshot(`${ssPrefix}open-editor-when-sticky`);
  });

  it('Subnavigation is sticky when on small window', () => {
    cy.waitUntil(() => {
      // do
      // Scroll the window 500px down
      cy.scrollTo(0, 500);
      // wait until
      return cy.getByTestid('grw-subnav-switcher').then($elem => !$elem.hasClass('grw-subnav-switcher-hidden'));
    });
    cy.waitUntilSkeletonDisappear();
    cy.viewport(600, 1024);
    cy.getByTestid('grw-subnav-switcher').within(() => {
      cy.get('#grw-page-editor-mode-manager').should('be.visible');
    })
    cy.screenshot(`${ssPrefix}sticky-on-small-window`);
  });
});
