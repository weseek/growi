describe('Access to sidebar', () => {
  const ssPrefix = 'access-to-sidebar-';

  context('when logged in', () => {
    beforeEach(() => {
      // login
      cy.fixture("user-admin.json").then(user => {
        cy.login(user.username, user.password);
      });
    });

    context('when access to root page', () => {
      beforeEach(() => {
        cy.visit('/');
        cy.waitUntilSkeletonDisappear();
        cy.collapseSidebar(false);
        cy.scrollTo('top');
      });

      describe('Test show/collapse button', () => {
        it('Successfully show sidebar', () => {
          cy.get('.grw-pagetree').should('be.visible');
          cy.screenshot(`${ssPrefix}1-sidebar-shown`, {capture: 'viewport'});
        });

        it('Successfully collapse sidebar', () => {
          cy.getByTestid('grw-navigation-resize-button').click({force: true});
          cy.screenshot(`${ssPrefix}2-sidebar-collapsed`, {capture: 'viewport'});
        });
      });

      describe('Test page tree tab', () => {
        it('Successfully access to page tree', () => {
          cy.getByTestid('grw-contextual-navigation-sub').within(() => {
            cy.get('.grw-pagetree').should('be.visible');
            cy.screenshot(`${ssPrefix}page-tree-1-access-to-page-tree`);
          });
        });

        it('Successfully hide page tree items', () => {
          cy.getByTestid('grw-contextual-navigation-sub').within(() => {
            cy.get('.grw-pagetree-open').should('be.visible');

            // hide page tree tiems
            cy.get('.grw-pagetree-triangle-btn').eq(0).click();
            cy.screenshot(`${ssPrefix}page-tree-2-hide-page-tree-items`);
          });
        });

        it('Successfully click Add to Bookmarks button', () => {
          // click three dots
          cy.get('.grw-pagetree-item-children').eq(0).within(() => {
            cy.getByTestid('open-page-item-control-btn').find('button').eq(0).invoke('css','display','block').click();
          });

          cy.scrollTo('top');
          cy.getByTestid('page-item-control-menu').should('have.class', 'show');
          cy.screenshot(`${ssPrefix}page-tree-3-before-click-button`);

          // click add remove bookmark btn
          cy.getByTestid('page-item-control-menu').should('have.class', 'show').within(() => {
            cy.getByTestid('add-remove-bookmark-btn').click();
          });

          // show dropdown again
          cy.get('.grw-pagetree-item-children').eq(0).within(() => {
            cy.getByTestid('open-page-item-control-btn').find('button').eq(0).invoke('css','display','block').click();
          });

          cy.scrollTo('top');
          cy.getByTestid('page-item-control-menu').should('have.class', 'show');
          cy.screenshot(`${ssPrefix}page-tree-4-after-click-button`);
        });

        it('Successfully show duplicate page modal', () => {
          cy.get('.grw-pagetree-item-children').eq(0).within(() => {
            cy.getByTestid('open-page-item-control-btn').find('button').eq(0).invoke('css','display','block').click();
          });
          cy.get('.dropdown-menu.show').should('be.visible').within(() => {
            cy.getByTestid('open-page-duplicate-modal-btn').click();
          });
          cy.getByTestid('page-duplicate-modal').should('be.visible').within(() => {
            cy.get('.rbt-input-main').type('_test');
            cy.screenshot(`${ssPrefix}page-tree-5-duplicate-page-modal`);
            cy.get('.modal-header > button').click();
          });
        });

        it('Successfully rename page', () => {
          cy.getByTestid('grw-contextual-navigation-sub').within(() => {
            cy.get('.grw-pagetree-item-children').eq(0).within(() => {
              cy.getByTestid('open-page-item-control-btn').find('button').eq(0).invoke('css','display','block').click()
            });
            cy.get('.dropdown-menu.show').should('be.visible').within(() => {
              cy.getByTestid('open-page-move-rename-modal-btn').click();
            });
            cy.get('.grw-pagetree-item-children').eq(0).within(() => {
              cy.getByTestid('closable-text-input').type('_newname');
            });
            cy.screenshot(`${ssPrefix}page-tree-6-rename-page`);
          });
        });

        it('Successfully show delete page modal', () => {
          cy.getByTestid('grw-contextual-navigation-sub').within(() => {
            cy.get('.grw-pagetree-item-children').eq(0).within(() => {
              cy.getByTestid('open-page-item-control-btn').find('button').eq(0).invoke('css','display','block').click()
            });
            cy.get('.dropdown-menu.show').should('be.visible').within(() => {
              cy.getByTestid('open-page-delete-modal-btn').click();
            });
          });
          cy.getByTestid('page-delete-modal').should('be.visible').within(() => {
            cy.screenshot(`${ssPrefix}page-tree-7-delete-page-modal`);
            cy.get('.modal-header > button').click();
          });
        });
      });

      describe('Test custom sidebar tab', () => {
        it('Successfully access to custom sidebar', () => {
          cy.getByTestid('grw-sidebar-nav-primary-custom-sidebar').click();

          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(1500); // Wait debounce for UserUISettings update

          cy.getByTestid('grw-contextual-navigation-sub').within(() => {
            cy.get('.grw-sidebar-content-header.h5').find('a');
            cy.screenshot(`${ssPrefix}custom-sidebar-1-access-to-custom-sidebar`);
          });
        });

        it('Successfully redirect to editor', () => {
          const content = '# HELLO \n ## Hello\n ### Hello';

          cy.get('.grw-sidebar-content-header.h5').find('a').click();
          cy.get('.CodeMirror textarea').type(content, {force: true});
          cy.screenshot(`${ssPrefix}custom-sidebar-2-redirect-to-editor`);
          cy.getByTestid('save-page-btn').click();
          cy.get('.layout-root').should('not.have.class', 'editing');
        });

        it('Successfully create custom sidebar content', () => {
          cy.getByTestid('grw-contextual-navigation-sub').within(() => {
            cy.get('.grw-custom-sidebar-content').should('be.visible');
            cy.screenshot(`${ssPrefix}custom-sidebar-3-content-created`);
          });
        });
      });

      describe('Test recent changes tab', () => {
        it('Successfully access to recent changes', () => {
          cy.getByTestid('grw-sidebar-nav-primary-recent-changes').click();

          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(1500); // Wait debounce for UserUISettings update

          cy.getByTestid('grw-recent-changes').should('be.visible');
          cy.get('.list-group-item').should('be.visible');

          cy.scrollTo('top');
          cy.screenshot(`${ssPrefix}recent-changes-1-access-to-recent-changes`);
        });

        it('Successfully switch content size', () => {
          cy.get('#grw-sidebar-contents-wrapper').within(() => {
            cy.get('#recentChangesResize').click({force: true});
            cy.get('.list-group-item').should('be.visible');
          });

          cy.scrollTo('top');
          cy.screenshot(`${ssPrefix}recent-changes-2-switch-content-size`);
        });
      });

      describe('Test tags tab', () => {
        it('Successfully access to tags', () => {
          cy.getByTestid('grw-sidebar-nav-primary-tags').click();

          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(1500); // Wait debounce for UserUISettings update

          cy.getByTestid('grw-contextual-navigation-sub').within(() => {
            cy.getByTestid('grw-tags-list').should('be.visible');
            cy.screenshot(`${ssPrefix}tags-1-access-to-tags`);
          });
        });

        it('Succesfully click all tags button', () => {
          cy.get('.grw-container-convertible > div > .btn-primary').click({force: true});
          cy.collapseSidebar(true);
          cy.getByTestid('grw-tags-list').should('be.visible');
          cy.screenshot(`${ssPrefix}tags-2-click-all-tags-button`);
        });
      });

      // TODO: No Draft pages on GROWI version 6
      // it('Successfully access to My Drafts page', () => {
      //   cy.visit('/');
      //   cy.collapseSidebar(true);
      //   cy.get('.grw-sidebar-nav-secondary-container').within(() => {
      //     cy.get('a[href*="/me/drafts"]').click();
      //   });
      //   cy.screenshot(`${ssPrefix}access-to-drafts-page`);
      // });

      describe('Test access to GROWI Docs page', () => {
        it('Successfully access to GROWI Docs page', () => {
          cy.get('.grw-sidebar-nav-secondary-container').within(() => {
            cy.get('a[href*="https://docs.growi.org"]').then(($a) => {
              const url = $a.prop('href')
              cy.request(url).its('body').should('include', '</html>');
            });
          });
        });
      });

      describe('Test access to trash page', () => {
        it('Successfully access to trash page', () => {
          cy.collapseSidebar(true);
          cy.get('.grw-sidebar-nav-secondary-container').within(() => {
            cy.get('a[href*="/trash"]').click();
          });

          cy.get('.grw-page-path-hierarchical-link').should('be.visible');
          cy.get('.grw-custom-nav-tab').should('be.visible');
          cy.screenshot(`${ssPrefix}access-to-trash-page`);
        });
      });
    });
  });
});
