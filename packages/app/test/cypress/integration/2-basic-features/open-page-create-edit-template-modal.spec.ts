context('Open Page presentation Template Modal', () => {

  const ssPrefix = 'access-to-modal-';

  let connectSid: string | undefined;

  before(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    cy.getCookie('connect.sid').then(cookie => {
      connectSid = cookie?.value;
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  beforeEach(() => {
    if (connectSid != null) {
      cy.setCookie('connect.sid', connectSid);
    }
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
  it('CreateEditTemplatePage is shown successfully', () => {
     cy.visit('/Sandbox/Bootstrap4', {  });
     cy.get('#grw-subnav-container').within(() => {
       cy.getByTestid('open-page-item-control-btn').click();
       cy.getByTestid('open-page-template-modal-btn').click();
    });

     cy.getByTestid('page-template-modal').should('be.visible')
     cy.screenshot(`${ssPrefix}-open-page-template-bootstrap4`);
  });

});
