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

  it('PresentationModal for "/" is shown successfully', () => {
    cy.visit('/');

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-presentation-modal-btn').click({force: true});
    });

    cy.getByTestid('.grw-presentation-modal').should('exist');
    cy.screenshot(`${ssPrefix}-opne-top`, { capture: 'viewport' });
  });

  it('PresentationModal for "/Sandbox/Bootstrap4" is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4');

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-presentation-modal-btn').click({force: true});
    });

    cy.getByTestid('.grw-presentation-modal').should('exist');
    cy.screenshot(`${ssPrefix}-open-bootstrap4`, { capture: 'viewport' });
  });

  it('PresentationModal for /Sandbox/Bootstrap4#Cards" is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4#Cards');

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-presentation-modal-btn').click({force: true});
    });

    cy.getByTestid('.grw-presentation-modal').should('exist');
    cy.screenshot(`${ssPrefix}-open-bootstrap4-with-ancker-link`, { capture: 'viewport' });
  });
});
