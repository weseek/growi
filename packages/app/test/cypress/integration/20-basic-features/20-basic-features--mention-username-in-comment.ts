context('Mention username in comment', () => {
  const ssPrefix = 'mention-username-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('Successfully mention username in comment', () => {
    const username = '@adm';
    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();

    cy.collapseSidebar(true, true);
    cy.getByTestid('pageCommentButton').click();
    cy.getByTestid('openCommentEditorButton').click();

    cy.get('.Codemirror').type(username);

    cy.waitUntil(() => {
      return cy.get('.Codemirror-hints').then($elem => $elem.is(':visible'));
    });
    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}1-username-found`) });
  });

  it('Username not found when mention username in comment', () => {
    const username = '@user';
    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();

    cy.collapseSidebar(true, true);
    cy.getByTestid('pageCommentButton').click();
    cy.getByTestid('openCommentEditorButton').click();

    cy.get('.Codemirror').type(username);

    cy.waitUntil(() => {
      return cy.get('.Codemirror-hints').then($elem => $elem.is(':visible'));
    });
    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}2-username-not-found`) });
  });

});

