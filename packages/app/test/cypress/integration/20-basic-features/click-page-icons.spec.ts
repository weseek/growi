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
    cy.waitUntilSkeletonDisappear();

    // Subscribe
    cy.get('#subscribe-button').click({force: true});
    cy.get('#subscribe-button').should('have.class', 'active');

    // position of the element is not fixed to be displayed, so the element is removed
    cy.get('body').then($body => {
      if ($body.find('[data-testid="subscribe-button-tooltip"]').length > 0) {
        cy.getByTestid('subscribe-button-tooltip').invoke('remove');
      }
    })
    cy.getByTestid('subscribe-button-tooltip').should('not.exist');

    cy.get('#grw-subnav-container').within(() => { cy.screenshot(`${ssPrefix}1-subscribe-page`) })

    // Unsubscribe
    cy.get('#subscribe-button').click({force: true});
    cy.get('#subscribe-button').should('not.have.class', 'active');

    // position of the element is not fixed to be displayed, so the element is removed
    cy.get('body').then($body => {
      if ($body.find('[data-testid="subscribe-button-tooltip"]').length > 0) {
        cy.getByTestid('subscribe-button-tooltip').invoke('remove');
      }
    })
    cy.getByTestid('subscribe-button-tooltip').should('not.exist');

    cy.get('#grw-subnav-container').within(() => { cy.screenshot(`${ssPrefix}2-unsubscribe-page`) })
  });

  it('Successfully Like / Dislike a page', () => {
    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();

    // like
    cy.get('#like-button').click({force: true});
    cy.get('#like-button').should('have.class', 'active');

    // position of the element is not fixed to be displayed, so the element is removed
    cy.get('body').then($body => {
      if ($body.find('[data-testid="like-button-tooltip"]').length > 0) {
        cy.getByTestid('like-button-tooltip').invoke('remove');
      }
    })
    cy.getByTestid('like-button-tooltip').should('not.exist');

    cy.get('#grw-subnav-container').within(() => { cy.screenshot(`${ssPrefix}3-like-page`) });

    // total liker
    cy.get('#po-total-likes').click({force: true});
    cy.get('.user-list-popover').should('be.visible')
    cy.get('#grw-subnav-container').within(() => { cy.screenshot(`${ssPrefix}4-likes-counter`) });

    // unlike
    cy.get('#like-button').click({force: true});
    cy.get('#like-button').should('not.have.class', 'active');

    // position of the element is not fixed to be displayed, so the element is removed
    cy.get('body').then($body => {
      if ($body.find('[data-testid="like-button-tooltip"]').length > 0) {
        cy.getByTestid('like-button-tooltip').invoke('remove');
      }
    })
    cy.getByTestid('like-button-tooltip').should('not.exist');

    cy.get('#grw-subnav-container').within(() => { cy.screenshot(`${ssPrefix}5-dislike-page`) });

    // total liker
    cy.get('#po-total-likes').click({force: true});
    cy.get('.user-list-popover').should('be.visible');
    cy.get('#grw-subnav-container').within(() => { cy.screenshot(`${ssPrefix}6-likes-counter`) });
  });

  it('Successfully Bookmark / Unbookmark a page', () => {
    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();

    // bookmark
    cy.get('#bookmark-button').click({force: true});
    cy.get('#bookmark-button').should('have.class', 'active');

    // position of the element is not fixed to be displayed, so the element is removed
    cy.get('body').then($body => {
      if ($body.find('[data-testid="bookmark-button-tooltip"]').length > 0) {
        cy.getByTestid('bookmark-button-tooltip').invoke('remove');
      }
    })
    cy.getByTestid('bookmark-button-tooltip').should('not.exist');

    cy.get('#grw-subnav-container').within(() => { cy.screenshot(`${ssPrefix}7-bookmark-page`) });

    // total bookmarker
    cy.get('#po-total-bookmarks').click({force: true});
    cy.get('.user-list-popover').should('be.visible');
    cy.get('#grw-subnav-container').within(() => { cy.screenshot(`${ssPrefix}8-bookmarks-counter`) });

    // unbookmark
    cy.get('#bookmark-button').click({force: true});
    cy.get('#bookmark-button').should('not.have.class', 'active');

    // position of the element is not fixed to be displayed, so the element is removed
    cy.get('body').then($body => {
      if ($body.find('[data-testid="bookmark-button-tooltip"]').length > 0) {
        cy.getByTestid('bookmark-button-tooltip').invoke('remove');
      }
    })
    cy.getByTestid('bookmark-button-tooltip').should('not.exist');

    cy.get('#grw-subnav-container').within(() => { cy.screenshot(`${ssPrefix}9-unbookmark-page`) });

    // total bookmarker
    cy.get('#po-total-bookmarks').click({force: true});
    cy.get('.user-list-popover').should('be.visible');
    cy.get('#grw-subnav-container').within(() => { cy.screenshot(`${ssPrefix}10-bookmarks-counter`) });
  });
  it('Successfully display list of "seen by user"', () => {
    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();

    cy.get('#grw-subnav-container').within(() => {
      cy.get('div.grw-seen-user-info').find('button#btn-seen-user').click({force: true});
    });

    // position of the element is not fixed to be displayed, so the element is removed
    cy.get('body').then($body => {
      if ($body.find('[data-testid="seen-user-info-tooltip"]').length > 0) {
        cy.getByTestid('seen-user-info-tooltip').invoke('remove');
      }
    })
    cy.getByTestid('seen-user-info-tooltip').should('not.exist');

    cy.get('.user-list-popover').should('be.visible')

    cy.get('#grw-subnav-container').within(() => {
      cy.screenshot(`${ssPrefix}11-seen-user-list`);
    });
  });

});
