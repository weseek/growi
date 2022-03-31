context('Open presentation modal', () => {

  const ssPrefix = 'access-to-presentation-modal-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('PresentationModal for "/" is shown successfully', () => {
    cy.visit('/');

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-presentation-modal-btn').click({force: true});
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-open-top`);
  });

  it('PresentationModal for "/Sandbox/Bootstrap4" is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4');

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-presentation-modal-btn').click({force: true});
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-open-bootstrap4`);
  });

  it('PresentationModal for /Sandbox/Bootstrap4#Cards" is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4#Cards');

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-presentation-modal-btn').click({force: true});
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-open-bootstrap4-with-ancker-link`);
  });
});
