describe('Access to PageCreateButton', () => {

  const ssPrefix = 'access-to-sidebar-';

  context('when logged in', () => {
    beforeEach(() => {
      // login
      cy.fixture("user-admin.json").then(user => {
        cy.login(user.username, user.password);
      });
    });

    context('when access to root page', { scrollBehavior: false }, () => {
      beforeEach(() => {
        cy.visit('/');
      });

      // describe('Test PageCreateButton', () => {

      //   it('Successfully create untitled page', () => {
      //     cy.waitUntil(() => cy.getByTestid('grw-sidebar-nav-page-create-button').should('be.visible'));
      //     cy.getByTestid('grw-sidebar-nav-page-create-button').click({ force: true });

      //     cy.waitUntil(() => cy.getByTestid('page-editor').should('be.visible'));
      //     cy.getByTestid('save-page-btn').as('save-page-btn').should('be.visible');

      //     cy.screenshot(`${ssPrefix}create-untitled-page`, { capture: 'fullPage' });
      //   });

      // });

      describe('Test PageCreateButton dropdown', () => {

        beforeEach(() => {
          cy.waitUntil(() => cy.getByTestid('grw-sidebar-nav-page-create-button').should('be.visible'));
          cy.getByTestid('grw-sidebar-nav-page-create-button').trigger('mouseover', { force: true });
          cy.getByTestid('grw-sidebar-nav-dropend-toggle').click({ force: true });
        });

        // it('Successfully create untitled page', () => {
        //   cy.getByTestid('grw-sidebar-nav-page-create-dropdown-item').click({ force: true });

        //   cy.waitUntil(() => cy.getByTestid('page-editor').should('be.visible'));
        //   cy.getByTestid('save-page-btn').as('save-page-btn').should('be.visible');

        //   cy.screenshot(`${ssPrefix}create-untitled-page`, { capture: 'fullPage' });
        // });

        // it("Successfully create today's memo", () => {
        //   cy.getByTestid("grw-sidebar-nav-today's-memo-crate-dropdown-item").click({ force:true });
        //   // 確実にtoday's memoが作成された保証を得て、スクショ撮影
        // });

        it('Successfully create children template', () => {
          cy.getByTestid("grw-sidebar-nav-children-template-create-dropdown-item").click({ force:true });
        });

        // it('Successfully create descendants template', () => {
        //   cy.getByTestid("grw-sidebar-nav-descendants-template-create-dropdown-item").click({ force:true });
        // });

      });
    });
  });
});
