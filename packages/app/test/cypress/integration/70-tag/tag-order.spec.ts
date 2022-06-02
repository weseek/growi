/* eslint-disable cypress/no-unnecessary-waiting */
context('Tag order', () => {
  const ssPrefix = 'tag-order-';

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

  it('Tag order', () => {
    const tag = 'we';

    // Visit home
    cy.visit('/');
    cy.screenshot(`${ssPrefix}visit-home`, {capture: 'viewport'});

    // Click tag that contain "we"
     cy.get('#grw-subnav-container').within(()=>{
      cy.get('a[href*="/_search?q=tag"]').contains(tag).click();
    });
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}click-tag-name`, {capture: 'viewport'});


    // Order by relevance
    cy.get('.grw-search-page-nav').within(() => {
      cy.get('.search-sort-option-btn').click({force: true});
      cy.get('.dropdown-menu-right').should('be.visible');
      cy.get('.dropdown-menu-right > button:nth-child(1)').click({force: true});
      cy.wait(1000);
    });
    cy.screenshot(`${ssPrefix}order-by-relevance`);

    // Order by creation date
     cy.get('.grw-search-page-nav').within(() => {
      cy.get('.search-sort-option-btn').click({force: true});
      cy.get('.dropdown-menu-right').should('be.visible');
      cy.get('.dropdown-menu-right > button:nth-child(2)').click({force: true});
      cy.wait(1000);
    });
    cy.screenshot(`${ssPrefix}order-by-creation-date`);

     // Order by last update date
     cy.get('.grw-search-page-nav').within(() => {
      cy.get('.search-sort-option-btn').click({force: true});
      cy.get('.dropdown-menu-right').should('be.visible');
      cy.get('.dropdown-menu-right > button:nth-child(3)').click({force: true});
      cy.wait(1000);
    });
    cy.screenshot(`${ssPrefix}order-by-last-update-date`);
  });

});
