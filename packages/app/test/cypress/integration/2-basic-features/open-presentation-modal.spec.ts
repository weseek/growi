
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

  it('PageCreateModal for "/" is shown successfully', () => {
    cy.visit('/');
    cy.getByTestid('open-page-item-control-button').first().click();
    cy.getByTestid('open-presentation-modal-btn').first().click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-opne-top`, { capture: 'viewport' });
  });

  it('PageCreateModal for "/Sandbox/Bootstrap4" is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4');
    cy.getByTestid('open-page-item-control-button').first().click();
    cy.getByTestid('open-presentation-modal-btn').first().click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-open-bootstrap4`, { capture: 'viewport' });
  });

  it('PageCreateModal for /Sandbox/Bootstrap4#Cards" is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4#Cards');
    cy.getByTestid('open-page-item-control-button').first().click();
    cy.getByTestid('open-presentation-modal-btn').first().click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-open-bootstrap4-with-ancker-link`, { capture: 'viewport' });
  });
});
