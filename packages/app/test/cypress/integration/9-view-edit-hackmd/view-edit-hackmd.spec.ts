/* eslint-disable cypress/no-unnecessary-waiting */
context('View, Edit, HackMD', () => {
  const ssPrefix = 'view-edit-hackmd--';

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
    cy.visit('/Sandbox/Math');
  });

  it('View', () => {
    cy.screenshot(`${ssPrefix}-view`, { capture: 'viewport' });
  });

  it('Edit', () => {
    cy.get('#grw-subnav-container .editor-button').click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-editor-layout`, { capture: 'viewport' });
    cy.get('#caret.btn-submit').click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-edit-completed`, { capture: 'viewport' });
  });

  it('HackMD', () => {
    cy.get('#grw-subnav-container .hackmd-button').click();
    cy.wait(1500);

    // Initial action when the page never activate hackmd
    cy.get("body").then($body => {
      if ($body.find("hackmd-start-button-container").length > 0) {
        cy.screenshot(`${ssPrefix}-hackmd-layout`, { capture: 'viewport' });
        cy.get('#hackmd-start-button-container > button').click();
        cy.wait(1500);
      }
    });

    cy.screenshot(`${ssPrefix}-hackmd-editor-layout`, { capture: 'viewport' });
    cy.get('#caret.btn-submit').click();
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-edit-completed`, { capture: 'viewport' });
  });

});
