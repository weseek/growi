context('Open Page Move Rename Modal', () => {

  const ssPrefix = 'access-to-page-move-rename-modal';

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
      cy.visit('/');
    }
  });

  it('PageMoveRenameModal is shown successfully', () => {
     cy.visit('/Sandbox/Bootstrap4', {  });
     cy.get('#grw-subnav-container').within(() => {
       cy.getByTestid('open-page-item-control-btn').click();
       cy.getByTestid('open-page-move-rename-modal-btn').click();
    });

     cy.getByTestid('page-rename-modal').should('be.visible').screenshot(`${ssPrefix}-open-bootstrap4`);
  });

});
