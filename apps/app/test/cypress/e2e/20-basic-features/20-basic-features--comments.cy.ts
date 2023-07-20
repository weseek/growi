context('Comment', () => {
  const ssPrefix = 'comments-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });

    // visit page
    cy.visit('/comments');
    cy.collapseSidebar(true, true);

    cy.getByTestid('page-comment-button').click();
  })

  it('Successfully add comments', () => {
    const commetText = 'add comment';

    // Open comment editor
    cy.waitUntil(() => {
      // do
      cy.getByTestid('open-comment-editor-button').click();
      // wait until
      return cy.get('.comment-write').then($elem => $elem.is(':visible'));
    });

    cy.waitUntil(() => {
      // do
      cy.get('.CodeMirror').type(commetText);
      // wait until
      return cy.get('.CodeMirror-hints').then($elem => $elem.is(':visible'));
    });

    // Check update comment count
    cy.getByTestid('page-comment-button').get('span:nth-child(2)').contains(1);

    cy.screenshot(`${ssPrefix}1-add-comments`);
  });

  it('Successfully reply comments', () => {
    const commetText = 'reply comment';

    // Open reply comment editor
    cy.waitUntil(() => {
      // do
      cy.get('.btn-comment-reply').click();
      // wait until
      return cy.get('.comment-write').then($elem => $elem.is(':visible'));
    });

    cy.waitUntil(() => {
      // do
      cy.get('.CodeMirror').type(commetText);
      // wait until
      return cy.get('.CodeMirror-hints').then($elem => $elem.is(':visible'));
    });

    // Check update comment count
    cy.getByTestid('page-comment-button').get('span:nth-child(2)').contains(1);

    cy.screenshot(`${ssPrefix}2-reply-comments`);
  });

  // Mention username in comment
  it('Successfully mention username in comment', () => {
    const username = '@adm';

    // Open comment editor
    cy.waitUntil(() => {
      // do
      cy.getByTestid('open-comment-editor-button').click();
      // wait until
      return cy.get('.comment-write').then($elem => $elem.is(':visible'));
    });

    cy.waitUntil(() => {
      // do
      cy.get('.CodeMirror').type(username);
      // wait until
      return cy.get('.CodeMirror-hints').then($elem => $elem.is(':visible'));
    });

    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}3-mention-username-found`) });
    // Click on mentioned username
    cy.get('.CodeMirror-hints > li').first().click();
    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}4-mention-username-mentioned`) });
  });

  it('Username not found when mention username in comment', () => {
    const username = '@user';

    // Open comment editor
    cy.waitUntil(() => {
      // do
      cy.getByTestid('open-comment-editor-button').click();
      // wait until
      return cy.get('.comment-write').then($elem => $elem.is(':visible'));
    });

    cy.waitUntil(() => {
      // do
      cy.get('.CodeMirror').type(username);
      // wait until
      return cy.get('.CodeMirror-hints').then($elem => $elem.is(':visible'));
    });

    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}5-mention-username-not-found`) });
    // Click on username not found hint
    cy.get('.CodeMirror-hints > li').first().click();
    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}6-mention-no-username-mentioned`) });
  });

})
