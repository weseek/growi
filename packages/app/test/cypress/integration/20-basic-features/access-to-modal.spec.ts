context('Access to Page Accessories Modal', () => {

  const ssPrefix = 'access-to-page-accessories-modal';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('Page History is shown successfully', () => {
     cy.visit('/Sandbox/Bootstrap4', {  });
     cy.get('#grw-subnav-container').within(() => {
       cy.getByTestid('open-page-item-control-btn').click();
       cy.getByTestid('open-page-accessories-modal-btn-with-history-tab').click();
    });

     cy.getByTestid('page-accessories-modal').should('be.visible')
     cy.getByTestid('page-history').should('be.visible')
     cy.screenshot(`${ssPrefix}-open-page-history-bootstrap4`);
  });
  it('Page Attachment Data is shown successfully', () => {
     cy.visit('/Sandbox/Bootstrap4', {  });
     cy.get('#grw-subnav-container').within(() => {
       cy.getByTestid('open-page-item-control-btn').click();
       cy.getByTestid('open-page-accessories-modal-btn-with-attachment-data-tab').click();
    });

     cy.getByTestid('page-accessories-modal').should('be.visible')
     cy.getByTestid('page-attachment').should('be.visible')
     cy.screenshot(`${ssPrefix}-open-page-attachment-data-bootstrap4`);
  });

});
