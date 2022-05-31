context('Access to Page Presentation Modal', () => {
  const ssPrefix = 'access-to-modal-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('PresentationModal is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4', {  });
    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click();
      cy.getByTestid('open-presentation-modal-btn').click();
   });

    cy.getByTestid('page-presentation-modal').should('be.visible')
    cy.screenshot(`${ssPrefix}-open-page-presentation-bootstrap4`);
 });

});



