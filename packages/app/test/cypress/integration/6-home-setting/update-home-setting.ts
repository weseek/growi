context('Update home setting', () => {
  const ssPrefix = 'update-home-setting-';

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

  it('Update User information', () => {

  });

  it('Update External account', () => {

  });

  it('Update Password setting', () => {

  });

  it('Update API setting', () => {

  });

  it('Update Editor setting', () => {

  });

  it('Update In-app notification setting', () => {

  });

});
