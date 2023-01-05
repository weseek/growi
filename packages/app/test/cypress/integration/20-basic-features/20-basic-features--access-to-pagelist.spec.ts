context('Access to pagelist', () => {
  const ssPrefix = 'access-to-pagelist-';
  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    cy.visit('/');
    cy.collapseSidebar(true);
    cy.waitUntilSkeletonDisappear();

    // open PageAccessoriesModal
    cy.waitUntil(() => {
      // do
      cy.getByTestid('pageListButton').click({force: true});
      // wait until
      return cy.getByTestid('descendants-page-list-modal').then($elem => $elem.is(':visible'));
    });

    cy.waitUntilSpinnerDisappear();
  });

  it('Page list modal is successfully opened ', () => {
    // Wait until the string "You cannot see this page" is no longer displayed
    cy.getByTestid('page-list-item-L').eq(0).within(() => {
      cy.get('.icon-exclamation').should('not.exist');
    });

    cy.waitUntilSpinnerDisappear();
    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}1-open-pagelist-modal`);
  });

  it('Successfully open PageItemControl', () => {
    cy.waitUntil(() => {
      // do
      cy.getByTestid('descendants-page-list-modal').within(() => {
        cy.getByTestid('page-list-item-L').first().within(() => {
          cy.getByTestid('open-page-item-control-btn').click();
        });
      });
      // wait until
      return cy.get('.dropdown-menu.show').then($elem => $elem.is(':visible'));
    });

    cy.get('.dropdown-menu.show').within(() => {
      cy.getByTestid('open-page-duplicate-modal-btn').should('be.visible')
    });

    cy.waitUntilSkeletonDisappear();
    cy.waitUntilSpinnerDisappear();
    cy.screenshot(`${ssPrefix}2-open-page-item-control-menu`);
  });

  it('Successfully expand and close modal', () => {
    cy.get('button.close').eq(0).click();

    cy.waitUntilSkeletonDisappear();
    cy.waitUntilSpinnerDisappear();
    cy.screenshot(`${ssPrefix}7-page-list-modal-size-fullscreen`);

    cy.get('button.close').eq(1).click();
    cy.screenshot(`${ssPrefix}8-close-page-list-modal`);
  });
});

context('Access to timeline', () => {
  const ssPrefix = 'access-to-timeline-';
  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });
  it('Timeline list successfully openend', () => {
    cy.visit('/');
    cy.collapseSidebar(true);

    cy.getByTestid('pageListButton').click({force: true});
    cy.getByTestid('descendants-page-list-modal').parent().should('have.class','show').within(() => {
      cy.get('.nav-title > li').eq(1).find('a').click();
    });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500); // wait for loading wiki
    cy.screenshot(`${ssPrefix}1-timeline-list`);
  });
});
