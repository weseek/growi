context('Click page icons button', () => {
  const ssPrefix = 'click-page-icon-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('Successfully subscribe/unsubscribe a page', () => {
    cy.visit('/Sandbox');
    cy.get('#grw-subnav-container').within(() => {
      // Subscribe
      cy.get('#subscribe-button').eq(0).click({force: true});
      cy.get('#subscribe-button').eq(0).should('have.class', 'active');
      cy.screenshot(`${ssPrefix}1-subscribe-page`);

      // Unsubscribe
      cy.get('#subscribe-button.active').eq(0).click({force: true});
      cy.get('#subscribe-button').eq(0).should('not.have.class', 'active');
      cy.screenshot(`${ssPrefix}2-unsubscribe-page`);
    });
  });

  it('Successfully Like / Dislike a page', () => {
    cy.visit('/Sandbox');
    cy.get('#grw-subnav-container').within(() => {
      cy.get('#like-button').click({force: true});
      cy.get('#like-button').should('have.class', 'active');
      cy.screenshot(`${ssPrefix}3-like-page`);
      cy.get('#po-total-likes').click({force: true});
    });
    cy.get('.user-list-popover').should('be.visible');

    cy.get('#grw-subnav-container').within(() => {
      cy.screenshot(`${ssPrefix}4-likes-counter`);
      cy.get('#like-button.active').click({force: true});
      cy.get('#like-button').should('not.have.class', 'active');
      cy.screenshot(`${ssPrefix}5-dislike-page`);
      cy.get('#po-total-likes').click({force: true});
    });

    cy.get('.user-list-popover').should('be.visible');

    cy.get('#grw-subnav-container').within(() => {
      cy.screenshot(`${ssPrefix}6-likes-counter`);
    });
  });

  it('Successfully Bookmark / Unbookmark a page', () => {
    cy.visit('/Sandbox');
    cy.get('#grw-subnav-container').within(() => {
      cy.get('#bookmark-button').click({force: true});
      cy.get('#bookmark-button').should('have.class', 'active');
      cy.screenshot(`${ssPrefix}7-bookmark-page`);
      cy.get('#po-total-bookmarks').click({force: true});
    });
    cy.get('.user-list-popover').should('be.visible');

    cy.get('#grw-subnav-container').within(() => {
      cy.screenshot(`${ssPrefix}8-bookmarks-counter`);
      cy.get('#bookmark-button.active').click({force: true});
      cy.get('#bookmark-button').should('not.have.class', 'active');
      cy.screenshot(`${ssPrefix}9-unbookmark-page`);
      cy.get('#po-total-bookmarks').click({force: true});
    });

    cy.get('.user-list-popover').should('be.visible');

    cy.get('#grw-subnav-container').within(() => {
      cy.screenshot(`${ssPrefix}10-bookmarks-counter`);
    });
  });

  it('Successfully display list of "seen by user"', () => {
    cy.visit('/Sandbox');
    cy.get('#grw-subnav-container').within(() => {
      cy.get('#btn-seen-user').click({force: true});
    });
    cy.get('.user-list-popover').should('be.visible');

    cy.get('#grw-subnav-container').within(() => {
      cy.screenshot(`${ssPrefix}11-seen-user-list`);
    });
  });

});
