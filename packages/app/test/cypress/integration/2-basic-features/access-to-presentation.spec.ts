
context('Open presentation modal', () => {
  const ssPrefix = 'access-to-presentation-modal-';

  let connectSid: string | undefined;

  before(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    cy.getCookie('connect.sid').then(cookie => {
      connectSid = cookie?.value;
    });
  });

  beforeEach(() => {
    if (connectSid != null) {
      cy.setCookie('connect.sid', connectSid);
    }
  });

  it('Successfully loaded the presentation modal in /.', () => {
    cy.visit('/');
    cy.getByTestid('sub-nav-buttons-page-item-control').first().click();
    cy.getByTestid('open-presentation-modal-btn').first().click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-sandbox-headers`, { capture: 'viewport' });
  });

});
