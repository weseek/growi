context('Access to sidebar', () => {
  const ssPrefix = 'access-to-sidebar-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(false);
  });

  it('Successfully show/collapse sidebar', () => {
    cy.visit('/');
    cy.screenshot(`${ssPrefix}1-sidebar-shown`, {capture: 'viewport'});
    cy.getByTestid('grw-navigation-resize-button').click({force: true});
    cy.screenshot(`${ssPrefix}2-sidebar-collapsed`, {capture: 'viewport'});

  });

  it('Successully change side bar size of latest changes', () => {
    cy.visit('/');
    cy.getByTestid('grw-sidebar-nav-primary-recent-changes').click();
    cy.getByTestid('grw-navigation-resize-button').click({force: true});
    cy.get('#grw-sidebar-contents-wrapper').within(() => {
      cy.get('#recentChangesResize').click({force: true});
      cy.screenshot(`${ssPrefix}1-current-sidebar-size`);
      cy.get('#recentChangesResize').click({force: true});
      cy.screenshot(`${ssPrefix}2-switch-sidebar-size`);
    });
  });

  it('Successfully access page from sidebar ', () => {
    cy.visit('/');
    cy.getByTestid('grw-sidebar-nav-primary-recent-changes').click();
    cy.getByTestid('grw-navigation-resize-button').click({force: true});
    cy.screenshot(`${ssPrefix}1-recent-changes-page-list`);
    cy.get('.list-group-item').eq(0).within(() => {
      cy.get('span.grw-page-path-hierarchical-link').find('a').click();
    })
    cy.screenshot(`${ssPrefix}2-open-first-recent-changes-page`);
  })
});
