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
    const oldPageName = '/our';
    const newPageName = '/ourus';

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

    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === oldPageName){
          cy.wrap($row).within(() => {
            cy.getByTestid('move-page').click({force: true});
            cy.wait(1500);
          });
        }
      });
    });

    // Rename page
    cy.get('.grw-rename-page').should('be.visible');
    cy.get('.grw-rename-page').within(() => {
      cy.getByTestid('new-page-name-input').clear({force: true})
      cy.getByTestid('new-page-name-input').click().focused().type(newPageName, {force: true})
      .should('have.value', newPageName);

    });
    cy.screenshot(`${ssPrefix}insert-new-page-name`, {capture: 'viewport'});

    // Submit new name
    cy.get('.grw-rename-page').within(() => {
      cy.getByTestid('new-page-name-input').click({force: true});
      cy.getByTestid('rename-page-button').click({force: true})
      cy.wait(1500);
    });
    cy.screenshot(`${ssPrefix}new-page-name-applied`, {capture: 'viewport'});

    //Visit /ourus
    cy.visit(newPageName);
    cy.screenshot(`${ssPrefix}visit-ourus-page`, {capture: 'viewport'});
  });



});
