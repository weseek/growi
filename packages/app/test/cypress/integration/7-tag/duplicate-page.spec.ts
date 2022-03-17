/* eslint-disable cypress/no-unnecessary-waiting */
context('Duplicate page by generated tag', () => {
  const ssPrefix = 'duplicate-page-';

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

  it('Duplicate page by generated tag', () => {
    const tag = 'we';
    const pageName = 'our';

    // Visit home
    cy.visit('/');
    cy.screenshot(`${ssPrefix}visit-home`, {capture: 'viewport'});

    // Click tag that contain "we"
    cy.get('#grw-subnav-container').within(()=>{
      cy.get('a[href*="/_search?q=tag"]').contains(tag).click()
    });
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}click-tag-name`, {capture: 'viewport'});

    cy.getByTestid('search-result-list').should('be.visible');

    // Click three dot menu
    cy.getByTestid('open-page-item-control-btn').first().click();
    cy.screenshot(`${ssPrefix}click-three-dots-menu`, {capture: 'viewport'});

    cy.getByTestid('duplicate-page').first().click({force: true});
    cy.wait(1000);
    cy.screenshot(`${ssPrefix}duplicate-page`, {capture: 'viewport'});

    // Insert page name
    cy.get('.grw-duplicate-page').should('be.visible');
    cy.get('.grw-duplicate-page').within(() => {
      cy.get('div.rbt-input-hint-container > input').type(pageName, {force: true});
    });
    cy.screenshot(`${ssPrefix}insert-page-name`, {capture: 'viewport'});

    // Click duplicate page button
    cy.get('.grw-duplicate-page').within(() => {
      cy.get('.modal-footer > button').click({force: true});
    });

    // Visit /our
    cy.visit(`/${pageName}`)
    cy.screenshot(`${ssPrefix}visit-our`, {capture: 'viewport'});

  });

});
