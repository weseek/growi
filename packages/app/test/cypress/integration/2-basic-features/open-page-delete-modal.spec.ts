context('Open PageDeleteModal', () => {

  const ssPrefix = 'open-page-delete-modal';

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

  it('PageDeleteModal is shown successfully', () => {
    cy.visit('/Sandbox');
    cy.getByTestid('open-page-item-control-btn')[0].click();
    cy.contains('Delete').click();
    cy.screenshot(`${ssPrefix}-open`,{ capture: 'viewport' });


  });
  it('PageDeleteModal is shown successfully', () => {
    cy.visit('/_search?q=tag:we');
    cy.getByTestid('open-page-item-control-btn')[0].click();
    cy.contains('Delete').click();
    cy.screenshot(`${ssPrefix}_search?q=tag:we`,{ capture: 'viewport' });


  });

});
