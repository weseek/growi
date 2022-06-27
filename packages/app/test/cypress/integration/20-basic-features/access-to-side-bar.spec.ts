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
    cy.getByTestid('grw-navigation-resize-button').click({force: true});
    cy.getByTestid('grw-sidebar-nav-primary-recent-changes').click();
  });
});
