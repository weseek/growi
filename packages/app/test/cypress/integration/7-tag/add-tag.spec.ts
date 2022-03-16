/* eslint-disable cypress/no-unnecessary-waiting */
context('Add Tag', () => {
  const ssPrefix = 'add-tag-';

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

  it('Add Tag', () => {
    const tag = 'we';
    cy.visit('/');
    cy.screenshot(`${ssPrefix}click-plus-button`, {capture: 'viewport'});

    cy.get('#edit-tags-btn-wrapper-for-tooltip > a').click({force: true});
    cy.wait(1000);

    cy.screenshot(`${ssPrefix}edit-tag-input`, {capture: 'viewport'});

    cy.get('#edit-tag-modal').within(() => {
      cy.get('.rbt-input-main').type(tag, {force: true});
    });
    cy.wait(1000);
    cy.screenshot(`${ssPrefix}type-tag-name`, {capture: 'viewport'});

    cy.get('#edit-tag-modal').then(($item) => {
      if($item.find('#rbt-menu-item-0 > a').length > 0){
        cy.get('#rbt-menu-item-0 > a').click({force: true});
        cy.wait(1000);
        cy.screenshot(`${ssPrefix}insert-tag-name`, {capture: 'viewport'});
      }
    });


    cy.get('#edit-tag-modal').within(() => {
      cy.get('div.modal-footer > button').click();
    });
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}click-done`, {capture: 'viewport'});
  });

});
