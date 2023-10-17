import { BlackoutGroup } from "../../support/blackout";

// Blackout for recalculation of toc content hight
const blackoutOverride = [
  ...BlackoutGroup.BASIS,
  ...BlackoutGroup.SIDE_CONTENTS,
];

describe('Access to sidebar', () => {
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

        // Since this is a sidebar test, call collapseSidebar in beforeEach.
        cy.collapseSidebar(false);
      });

      describe('Test show/collapse button', () => {
        it('Successfully show sidebar', () => {
          cy.getByTestid('grw-contextual-navigation-child').should('be.visible');

          cy.waitUntilSkeletonDisappear();
          cy.screenshot(`${ssPrefix}1-sidebar-shown`, {
            capture: 'viewport',
            blackout: blackoutOverride,
          });
        });

        // TODO: rewrite test case with grw-switch-collapse-button
        it('Successfully collapse sidebar', () => {
          cy.getByTestid('grw-switch-collapse-button').click({force: true});

          cy.getByTestid('grw-contextual-navigation-child').should('not.be.visible');

          cy.waitUntilSkeletonDisappear();
          cy.screenshot(`${ssPrefix}2-sidebar-collapsed`, {
            capture: 'viewport',
            blackout: blackoutOverride,
          });
        });
      });

      describe('Test page tree tab', () => {
        beforeEach(() => {
          cy.getByTestid('grw-sidebar-nav-primary-page-tree').should('be.visible')
            .then($elem => {
              // open if inactive
              if (!$elem.hasClass('active')) {
                cy.getByTestid('grw-sidebar-nav-primary-page-tree').click();
              }
            });
        });

        it('Successfully access to page tree', () => {
          cy.getByTestid('grw-contextual-navigation-child').within(() => {
            cy.getByTestid('grw-pagetree-item-container').should('be.visible');

            cy.waitUntilSkeletonDisappear();
            cy.screenshot(`${ssPrefix}page-tree-1-access-to-page-tree`, { blackout: blackoutOverride });
          });
        });

        it('Successfully hide page tree items', () => {
          cy.getByTestid('grw-contextual-navigation-child').within(() => {
            cy.get('.grw-pagetree-open').should('be.visible');

            // hide page tree tiems
            cy.get('.grw-pagetree-triangle-btn').first().click();

            cy.screenshot(`${ssPrefix}page-tree-2-hide-page-tree-items`, { blackout: blackoutOverride });
          });
        });

        it('Successfully click Add to Bookmarks button', () => {
          cy.waitUntil(() => {
            // do
            cy.getByTestid('grw-contextual-navigation-child').within(() => {
              cy.get('.grw-pagetree-item-children').first().as('pagetreeItem').within(() => {
                cy.getByTestid('open-page-item-control-btn').find('button').first().invoke('css','display','block').click()
              });
            });
            // wait until
            return cy.get('.dropdown-menu.show').then($elem => $elem.is(':visible'));
          });

          cy.screenshot(`${ssPrefix}page-tree-3-before-click-button`, { blackout: blackoutOverride });

          // click add remove bookmark btn
          cy.getByTestid('page-item-control-menu').should('have.class', 'show')
          cy.getByTestid('add-remove-bookmark-btn').click();

          // show dropdown again
          cy.waitUntil(() => {
            // do
            cy.getByTestid('grw-contextual-navigation-child').within(() => {
              cy.get('.grw-pagetree-item-children').first().as('pagetreeItem').within(() => {
                cy.getByTestid('open-page-item-control-btn').find('button').first().invoke('css','display','block').click()
              });
            });
            // wait until
            return cy.get('.dropdown-menu.show').then($elem => $elem.is(':visible'));
          });

          cy.screenshot(`${ssPrefix}page-tree-4-after-click-button`, { blackout: blackoutOverride });
        });

        it('Successfully show duplicate page modal', () => {
          cy.waitUntil(() => {
            // do
            cy.getByTestid('grw-contextual-navigation-child').within(() => {
              cy.get('.grw-pagetree-item-children').first().as('pagetreeItem').within(() => {
                cy.getByTestid('open-page-item-control-btn').find('button').first().invoke('css','display','block').click()
              });
            });
            // wait until
            return cy.get('.dropdown-menu.show').then($elem => $elem.is(':visible'));
          });

          cy.get('.dropdown-menu.show').within(() => {
            cy.getByTestid('open-page-duplicate-modal-btn').should('be.visible').click();
          });

          cy.getByTestid('page-duplicate-modal').should('be.visible').within(() => {
            cy.get('.form-control').type('_test');

            cy.screenshot(`${ssPrefix}page-tree-5-duplicate-page-modal`, { blackout: blackoutOverride });

            cy.get('.modal-header > button').click();
          });
        });

        it('Successfully rename page', () => {
          cy.waitUntil(() => {
            // do
            cy.getByTestid('grw-contextual-navigation-child').within(() => {
              cy.get('.grw-pagetree-item-children').first().as('pagetreeItem').within(() => {
                cy.getByTestid('open-page-item-control-btn').find('button').first().invoke('css','display','block').click()
              });
            });
            // wait until
            return cy.get('.dropdown-menu.show').then($elem => $elem.is(':visible'));
          });

          cy.get('.dropdown-menu.show').within(() => {
            cy.getByTestid('open-page-move-rename-modal-btn').should('be.visible').click();
          });

          cy.get('@pagetreeItem').within(() => {
            cy.getByTestid('closable-text-input').type('_newname');
          })

          cy.screenshot(`${ssPrefix}page-tree-6-rename-page`, { blackout: blackoutOverride });
        });

        it('Successfully show delete page modal', () => {
          cy.waitUntil(() => {
            // do
            cy.getByTestid('grw-contextual-navigation-child').within(() => {
              cy.get('.grw-pagetree-item-children').first().as('pagetreeItem').within(() => {
                cy.getByTestid('open-page-item-control-btn').find('button').first().invoke('css','display','block').click()
              });
            });
            // wait until
            return cy.get('.dropdown-menu.show').then($elem => $elem.is(':visible'));
          });

          cy.get('.dropdown-menu.show').within(() => {
            cy.getByTestid('open-page-delete-modal-btn').should('be.visible').click();
          });

          cy.getByTestid('page-delete-modal').should('be.visible').within(() => {
            cy.screenshot(`${ssPrefix}page-tree-7-delete-page-modal`, { blackout: blackoutOverride });
            cy.get('.modal-header > button').click();
          });
        });
      });

      describe('Test custom sidebar tab', () => {
        beforeEach(() => {
          cy.getByTestid('grw-sidebar-nav-primary-custom-sidebar').should('be.visible')
            .then($elem => {
              // open if inactive
              if (!$elem.hasClass('active')) {
                cy.getByTestid('grw-sidebar-nav-primary-custom-sidebar').click();
              }
            });
        });

        it('Successfully access to custom sidebar', () => {
          cy.getByTestid('grw-contextual-navigation-child').within(() => {
            cy.get('.grw-sidebar-content-header > h3').find('a');

            cy.waitUntilSkeletonDisappear();
            cy.screenshot(`${ssPrefix}custom-sidebar-1-access-to-custom-sidebar`, { blackout: blackoutOverride });
          });
        });

        it('Successfully redirect to editor', () => {
          const content = '# HELLO \n ## Hello\n ### Hello';

          cy.get('.grw-sidebar-content-header > h3 > a').should('be.visible').click();

          cy.get('.layout-root').should('have.class', 'editing');
          cy.get('.CodeMirror textarea').type(content, {force: true});

          cy.screenshot(`${ssPrefix}custom-sidebar-2-redirect-to-editor`, { blackout: blackoutOverride });

          cy.getByTestid('save-page-btn').click();
        });

        it('Successfully create custom sidebar content', () => {
          cy.getByTestid('grw-sidebar-nav-primary-custom-sidebar')
            .should('be.visible')
            .should('have.class', 'active');

          cy.waitUntilSkeletonDisappear();
          cy.screenshot(`${ssPrefix}custom-sidebar-3-content-created`, { blackout: blackoutOverride });
        });
      });

      describe('Test recent changes tab', () => {
        beforeEach(() => {
          cy.getByTestid('grw-sidebar-nav-primary-recent-changes').should('be.visible')
            .then($elem => {
              // open if inactive
              if (!$elem.hasClass('active')) {
                cy.getByTestid('grw-sidebar-nav-primary-recent-changes').click();
              }
            });
        });

        it('Successfully access to recent changes', () => {
          cy.getByTestid('grw-recent-changes').should('be.visible');
          cy.get('.list-group-item').should('be.visible');

          // The scope of the screenshot is not narrowed because the blackout is shifted
          cy.screenshot(`${ssPrefix}recent-changes-access-to-recent-changes`, { blackout: blackoutOverride });
        });

      });

      describe('Test tags tab', () => {
        beforeEach(() => {
          cy.getByTestid('grw-sidebar-nav-primary-tags').should('be.visible')
            .then($elem => {
              // open if inactive
              if (!$elem.hasClass('active')) {
                cy.getByTestid('grw-sidebar-nav-primary-tags').click();
              }
            });
        });

        it('Successfully access to tags', () => {
          cy.getByTestid('grw-contextual-navigation-child').within(() => {
            cy.getByTestid('grw-tags-list').should('be.visible');

            cy.screenshot(`${ssPrefix}tags-1-access-to-tags`, { blackout: blackoutOverride });
          });
        });

        it('Succesfully click all tags button', () => {
          cy.get('.grw-container-convertible > div > .btn-primary').click({force: true});
          cy.collapseSidebar(true);
          cy.getByTestid('grw-tags-list').should('be.visible');

          cy.screenshot(`${ssPrefix}tags-2-click-all-tags-button`, { blackout: blackoutOverride });
        });
      });

      // // TODO: No Drafts pages on GROWI version 6
      // it('Successfully access to My Drafts page', () => {
      //   cy.visit('/');
      //   cy.collapseSidebar(true);
      //   cy.get('.grw-sidebar-nav-secondary-container').within(() => {
      //     cy.get('a[href*="/me/drafts"]').click();
      //   });
      //   cy.screenshot(`${ssPrefix}access-to-drafts-page`, { blackout: blackoutOverride });
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

          cy.screenshot(`${ssPrefix}access-to-trash-page`, { blackout: blackoutOverride });
        });
      });
    });
  });
});
