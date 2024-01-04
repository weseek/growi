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

      describe('Test PageCreateButton', () => {
        // beforeEach(() => {
        //   cy.visit('/')
        //   cy.getByTestid('grw-sidebar-nav-page-create-button').should('be.visible')
        //     .then($elem => {
        //       if (!$elem.hasClass('active')) {
        //         cy.getByTestid('grw-sidebar-nav-page-create-button').click();
        //       }
        //     })
        // });

        it('Successfully create untitled page', () => {

          // cy.waitUntil(() => {
          //   // ページ作成ボタンが表示されるまで待機
          //   cy.getByTestid('grw-sidebar-nav-page-create-button').should('be.visible');

          //   // ページ作成ボタンをクリック
          //   cy.getByTestid('grw-sidebar-nav-page-create-button').click({ force: true });

          //   // ページエディタが表示されるかどうかを確認して条件を返す
          //   return cy.getByTestid('page-editor').should('be.visible');
          // });

          cy.waitUntil(() => cy.getByTestid('grw-sidebar-nav-page-create-button').should('be.visible'));
          cy.getByTestid('grw-sidebar-nav-page-create-button').click({force: true});

          cy.waitUntil(() => cy.getByTestid('page-editor').should('be.visible'));
          cy.getByTestid('save-page-btn').as('save-page-btn').should('be.visible');

          cy.screenshot(`${ssPrefix}create-untitled-page`);
        });
      });

      // describe('Test PageCreateButton dropdown', () => {

      //   it('Successfully create untitled page', () => {});
      //   it("Successfully create today's page", () => {});
      //   it('Successfully create children template', () => {});
      //   it('Successfully create descendants template', () => {});

      // });
    });
  });
});
