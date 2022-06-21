/* eslint-disable cypress/no-unnecessary-waiting */
context('Page icon buttons', () => {
  const ssPrefix = 'page-icon-buttons-';

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

  it('Presentation Page', () => {
    cy.visit('/Sandbox/Math');
    cy.get('#subscribe-button').eq(0).click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-1-subscribe-button-enabled`, { capture: 'viewport' });
    cy.get('#subscribe-button').eq(0).click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-2-subscribe-button-disabled`, { capture: 'viewport' });

    cy.get('#like-button').eq(0).click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-3-like-button-enabled`, { capture: 'viewport' });
    cy.get('#po-total-likes').eq(0).click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-4-like-button-enabled-counter`, { capture: 'viewport' });

    cy.get('#like-button').eq(0).click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-5-like-button-disabled`, { capture: 'viewport' });
    cy.get('#po-total-likes').eq(0).click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-6-like-button-disabled-counter`, { capture: 'viewport' });

    cy.get('#bookmark-button').eq(0).click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-7-bookmark-button-enabled`, { capture: 'viewport' });
    cy.get('#po-total-bookmarks').eq(0).click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-8-bookmark-button-enabled-counter`, { capture: 'viewport' });

    cy.get('#bookmark-button').eq(0).click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-9-bookmark-button-disabled`, { capture: 'viewport' });
    cy.get('#po-total-bookmarks').eq(0).click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-10-bookmark-button-disabled-counter`, { capture: 'viewport' });

    cy.get('#btn-seen-user').eq(0).click();
    cy.wait(500);
    cy.screenshot(`${ssPrefix}-12-bookmark-button-counter`, { capture: 'viewport' });
  });

});
