/* eslint-disable cypress/no-unnecessary-waiting */
context('Rename page from generated tag', () => {
  const ssPrefix = 'rename-page-';

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

  it('Rename page from generated tag', () => {
    const tag = 'we';
    const oldPageName = 'our';
    const newPageName = 'ourus';

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

    // Click three dot menu on item that contain /our
    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === oldPageName){
          cy.wrap($row).within(() => {
            cy.getByTestid('open-page-item-control-btn').click();
          })
        }
      })
    })
    cy.screenshot(`${ssPrefix}click-three-dots-menu`, {capture: 'viewport'});

    // Rename page
    cy.getByTestid('move-page').click({force: true});

    cy.wait(1500);
    cy.get('.grw-rename-page').should('be.visible');
    cy.get('.grw-rename-page').within(() => {
      cy.get('input[class="rbt-input-main"]').clear({force: true});
      cy.get('input[class="rbt-input-main"]').type(`/${newPageName}`, {force: true});

    });
    cy.screenshot(`${ssPrefix}insert-new-page-name`, {capture: 'viewport'});
  });





});
