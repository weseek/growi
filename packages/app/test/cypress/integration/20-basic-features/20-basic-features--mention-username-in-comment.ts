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
    cy.getByTestid('pageCommentButton').click();

    // Open comment editor
    cy.waitUntil(() => {
      // do
      cy.getByTestid('openCommentEditorButton').click();
      // wait until
      return cy.get('.comment-write').then($elem => $elem.is(':visible'))
    })

  });

  it('Successfully mention username in comment', () => {
    const username = '@adm';

    cy.waitUntil(() => {
      // do
      cy.get('.Codemirror').type(username);
      // wait until
      return cy.get('.Codemirror-hints').then($elem => $elem.is(':visible'));
    });
    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}1-username-found`) });
  });

  it('Username not found when mention username in comment', () => {
    const username = '@user';

    cy.waitUntil(() => {
      // do
      cy.get('.Codemirror').type(username);
      // wait until
      return cy.get('.Codemirror-hints').then($elem => $elem.is(':visible'));
    });
    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}2-username-not-found`) });
  });

});

