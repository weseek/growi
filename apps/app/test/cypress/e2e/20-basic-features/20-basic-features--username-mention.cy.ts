context('Mention username in comment', () => {
  const ssPrefix = 'mention-username-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });

    // Visit /Sandbox
    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();

    cy.collapseSidebar(true, true);

    // Go to comment page
    cy.getByTestid('page-comment-button').click();

    // Open comment editor
    cy.waitUntil(() => {
      // do
      cy.getByTestid('open-comment-editor-button').click();
      // wait until
      return cy.get('.comment-write').then($elem => $elem.is(':visible'));
    });

  });

  it('Successfully mention username in comment', () => {
    const username = 'adm';

    cy.intercept('GET', `/_api/v3/users/usernames?q=${username}&limit=20`).as('searchUsername');
    cy.get('.CodeMirror').type('@' + username);
    cy.wait('@searchUsername');
    cy.get('.CodeMirror-hints').should('be.visible');


    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}1-username-found`) });
    // Click on mentioned username
    cy.get('.CodeMirror-hints > li').first().click();
    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}2-username-mentioned`) });
  });

  it('Username not found when mention username in comment', () => {
    const username = 'user';

    cy.intercept('GET', `/_api/v3/users/usernames?q=${username}&limit=20`).as('searchUsername');
    cy.get('.CodeMirror').type('@' + username);
    cy.wait('@searchUsername');
    cy.get('.CodeMirror-hints').should('be.visible');

    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}3-username-not-found`) });
    // Click on username not found hint
    cy.get('.CodeMirror-hints > li').first().click();
    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}4-no-username-mentioned`) });
  });

});
