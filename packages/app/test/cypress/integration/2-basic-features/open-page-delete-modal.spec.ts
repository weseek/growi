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
    cy.getByTestid('open-delete-modal???')[0].click();

    cy.contains('Delete').click();
    cy.screenshot(`${ssPrefix}-open`,{ capture: 'viewport' });


  });

});
