/* eslint-disable cypress/no-unnecessary-waiting */
context('Tag', () => {
  const ssPrefix = 'tag-';

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
    cy.get('#edit-tags-btn-wrapper-for-tooltip > a').click({force: true});
    cy.wait(1000);

    cy.screenshot(`${ssPrefix}click-add-tag`, {capture: 'viewport'});

    cy.get('#edit-tag-modal').within(() => {
      cy.get('.rbt-input-main').type(tag, {force: true});
      cy.wait(1500)
      cy.get('#rbt-menu-item-0 > a').should('be.visible');
      cy.get('#rbt-menu-item-0 > a').click({force: true});
    });
    cy.wait(1000);
    cy.screenshot(`${ssPrefix}insert-tag-name`, {capture: 'viewport'});

  });

});
