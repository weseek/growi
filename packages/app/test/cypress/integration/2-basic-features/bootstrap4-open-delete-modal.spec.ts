context('Open Page Delete Modal', () => {

  const ssPrefix = 'bootstrap4-open-delete-modal-';

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

  it('PageDeleteModal is successfully', () => {
     cy.visit('/Bootstrap4', {  });
     cy.getByTestid('open-page-item-control-btn')[0].click();
     cy.contains('Delete').click();
     cy.screenshot(`${ssPrefix}-bootstrap4`,{ capture: 'viewport' });
  });

});

