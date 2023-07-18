context('Access to sharelink by guest', () => {
  const ssPrefix = 'access-to-sharelink-by-guest-';

  let createdSharelinkId: string;

  it('Prepare sharelink', () => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });

    cy.visit('/Sandbox/Bootstrap4');
    cy.waitUntilSkeletonDisappear();

    // open dropdown
    cy.waitUntil(() => {
      // do
      cy.get('#grw-subnav-container').within(() => {
        cy.getByTestid('open-page-item-control-btn').find('button').click({force: true});
      });
      // wait until
      return cy.getByTestid('page-item-control-menu').then($elem => $elem.is(':visible'))
    });

    // open modal
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      cy.getByTestid('open-page-accessories-modal-btn-with-share-link-management-data-tab').click({force: true});
    });
    cy.waitUntilSpinnerDisappear();
    cy.getByTestid('page-accessories-modal').should('be.visible');
    cy.getByTestid('share-link-management').should('be.visible');

    // create share link
    cy.getByTestid('share-link-management').within(() => {
      cy.getByTestid('btn-sharelink-toggleform').should('be.visible').click();
      cy.getByTestid('btn-sharelink-issue').should('be.visible').click();

      cy.get('tbody')
        .find('tr').first() // the first row
        .find('td').first() // the first column
        .find('span').first().then((elem) => {

        // store id
        createdSharelinkId = elem.text();
        // overwrite the label
        elem.html('63d100000000000000000000');
      });
    });

    cy.getByTestid('page-accessories-modal').within(() => { cy.screenshot(`${ssPrefix}-sharelink-created`) });
  });

  it('The sharelink page is successfully loaded', () => {
    cy.visit(`/share/${createdSharelinkId}`);

    cy.getByTestid('grw-contextual-sub-nav').should('be.visible');
    cy.get('.wiki').should('be.visible');

    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}-access-to-sharelink`);
  });

});


