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

  it('/_search?q=tag:we is shown successfully', () => {
    cy.visit('/_search?q=tag:we');
    cy.getByTestid('open-page-item-control-btn').click();
    cy.contains('Delete').click();
    cy.screenshot(`${ssPrefix}-open-page-item-control-btn`,{ capture: 'viewport' });


  });

});
