context('Open Page Presentation Modal', () => {
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

context('Move to Template Editing Mode', () => {
  const ssPrefix = 'access-to-modal-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });


  it('Moving to Template Editor mode for only child pages successfully', () => {
     cy.visit('/Sandbox/Bootstrap4', {  });
     cy.get('#grw-subnav-container').within(() => {
       cy.getByTestid('open-page-item-control-btn').click();
       cy.getByTestid('open-page-template-modal-btn').click();
    });

     cy.getByTestid('page-template-modal').should('be.visible')
     cy.screenshot(`${ssPrefix}-open-page-template-bootstrap4`);
     cy.getByTestid('template-button-children').click();
     cy.url().should('include', '/_template#edit');
     cy.screenshot();
  });

  it('Moving to Template Editor mode including decendants successfully', () => {
    cy.visit('/Sandbox/Bootstrap4', {  });
    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click();
      cy.getByTestid('open-page-template-modal-btn').click();
   });

    cy.getByTestid('page-template-modal').should('be.visible')
    cy.screenshot(`${ssPrefix}-open-page-template-bootstrap4`);
    cy.getByTestid('template-button-decendants').click();
    cy.url().should('include', '/__template#edit');
    cy.screenshot();
 });

});


