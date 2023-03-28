context('Mention username in comment', () => {
  const ssPrefix = 'mention-username-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('/Successfully open comment editor', () => {

    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();

    cy.collapseSidebar(true, true);
    cy.getByTestid('pageCommentButton').click();
    cy.getByTestid('openCommentEditorButton').click();

    cy.screenshot(`${ssPrefix}-open-comment-editor`);
  });
});

