context('Comment', () => {
  const ssPrefix = 'comments-';
  let commentCount = 0;

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });

    // visit page
    cy.visit('/comment');
    cy.collapseSidebar(true, true);
  })

  it('Create comment page', () => {
    // save page
    cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.get('@pageEditorModeManager').within(() => {
        cy.get('button:nth-child(2)').click();
      });
      // until
      return cy.get('.layout-root').then($elem => $elem.hasClass('editing'));
    });
    cy.get('.CodeMirror').should('be.visible');

    cy.getByTestid('page-editor').should('be.visible');
    cy.getByTestid('save-page-btn').click();
  })

  it('Successfully add comments', () => {
    const commetText = 'add comment';

    cy.getByTestid('page-comment-button').click();

    // Open comment editor
    cy.waitUntil(() => {
      // do
      cy.getByTestid('open-comment-editor-button').click();
      // wait until
      return cy.get('.comment-write').then($elem => $elem.is(':visible'));
    });

    cy.get('.CodeMirror').type(commetText);
    cy.getByTestid("comment-submit-button").eq(0).click();

    // Check update comment count
    commentCount += 1
    cy.getByTestid('page-comment-button').contains(commentCount);
    cy.screenshot(`${ssPrefix}1-add-comments`);
  });

  it('Successfully reply comments', () => {
    const commetText = 'reply comment';

    cy.getByTestid('page-comment-button').click();

    // Open reply comment editor
    cy.waitUntil(() => {
      // do
      cy.getByTestid('comment-reply-button').eq(0).click();
      // wait until
      return cy.get('.comment-write').then($elem => $elem.is(':visible'));
    });

    cy.get('.CodeMirror').type(commetText);
    cy.getByTestid("comment-submit-button").eq(0).click();

    // Check update comment count
    commentCount += 1
    cy.getByTestid('page-comment-button').contains(commentCount);
    cy.screenshot(`${ssPrefix}2-reply-comments`);
  });

  it('Successfully delete comments', () => {

    cy.getByTestid('page-comment-button').click();

    cy.get('.page-comments').should('be.visible');
    cy.getByTestid('comment-delete-button').eq(0).click({force: true});
    cy.get('.modal-content').then($elem => $elem.is(':visible'));
    cy.get('.modal-footer > button:nth-child(3)').click();

    // Check update comment count
    commentCount -= 2
    cy.getByTestid('page-comment-button').contains(commentCount);
    cy.screenshot(`${ssPrefix}3-delete-comments`);
  });

  // Mention username in comment
  it('Successfully mention username in comment', () => {
    const username = '@adm';

    cy.getByTestid('page-comment-button').click();

    // Open comment editor
    cy.waitUntil(() => {
      // do
      cy.getByTestid('open-comment-editor-button').click();
      // wait until
      return cy.get('.comment-write').then($elem => $elem.is(':visible'));
    });

    cy.appendTextToEditorUntilContains(username, 10000);

    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}4-mention-username-found`) });
    // Click on mentioned username
    cy.get('.CodeMirror-hints > li').first().click();
    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}5-mention-username-mentioned`) });
  });

  it('Username not found when mention username in comment', () => {
    const username = '@user';

    cy.getByTestid('page-comment-button').click();

    // Open comment editor
    cy.waitUntil(() => {
      // do
      cy.getByTestid('open-comment-editor-button').click();
      // wait until
      return cy.get('.comment-write').then($elem => $elem.is(':visible'));
    });

    cy.appendTextToEditorUntilContains(username);

    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}6-mention-username-not-found`) });
    // Click on username not found hint
    cy.get('.CodeMirror-hints > li').first().click();
    cy.get('#comments-container').within(() => { cy.screenshot(`${ssPrefix}7-mention-no-username-mentioned`) });
  });

})
