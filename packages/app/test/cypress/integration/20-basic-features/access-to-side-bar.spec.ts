context('Access to sidebar', () => {
  const ssPrefix = 'access-to-sidebar-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(false);
  });

  it('Successfully show/collapse sidebar', () => {
    cy.visit('/');
    cy.screenshot(`${ssPrefix}-1-sidebar-shown`, {capture: 'viewport'});
    cy.getByTestid('grw-navigation-resize-button').click({force: true});
    cy.screenshot(`${ssPrefix}-2-sidebar-collapsed`, {capture: 'viewport'});

  });

  it('Successully change side bar size of recent changes', () => {
    cy.visit('/');
    cy.getByTestid('grw-sidebar-nav-primary-recent-changes').click();
    cy.collapseSidebar(false);
    cy.get('#grw-sidebar-contents-wrapper').within(() => {
      cy.get('#recentChangesResize').click({force: true});
      cy.screenshot(`${ssPrefix}size-1-current-sidebar-size`);
      cy.get('#recentChangesResize').click({force: true});
      cy.screenshot(`${ssPrefix}size-2-switch-sidebar-size`);
    });
  });

  it('Successfully access page from sidebar ', () => {
    cy.visit('/');
    cy.screenshot(`${ssPrefix}recent-changes-1-page-list`);
    cy.get('.list-group-item').eq(0).within(() => {
      cy.get('span.grw-page-path-hierarchical-link').find('a').click();
    })
    cy.screenshot(`${ssPrefix}recent-changes-2-open-first-page`);

    cy.visit('/Sandbox');
    // Add tag
    cy.get('#edit-tags-btn-wrapper-for-tooltip > a').click({force: true});
    cy.get('#edit-tag-modal').should('be.visible');

    cy.get('#edit-tag-modal').within(() => {
      cy.get('.rbt-input-main').type('test');
      cy.get('#tag-typeahead-asynctypeahead').should('be.visible');
      cy.get('#tag-typeahead-asynctypeahead-item-0').should('be.visible');
      cy.get('a#tag-typeahead-asynctypeahead-item-0').click({force: true})
    });

    cy.get('#edit-tag-modal').within(() => {
      cy.get('div.modal-footer > button').click();
    });
    cy.visit('/Sandbox');
    cy.get('.grw-taglabels-container > form > a').contains('test').click();
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.screenshot(`${ssPrefix}recent-changes-3-click-on-tag-results`, {capture: 'viewport'});
  });

  it('Successfully create a custom sidebar page', () => {
    const content = '# HELLO \n ## Hello\n ### Hello';
    cy.visit('/');
    cy.getByTestid('grw-sidebar-nav-primary-custom-sidebar').click();
    cy.screenshot(`${ssPrefix}custom-sidebar-1-click-on-custom-sidebar`)
    cy.get('.grw-sidebar-content-header.h5').should('be.visible').find('a').click();

    cy.get('.CodeMirror textarea').type(content, {force: true});
    cy.screenshot(`${ssPrefix}custom-sidebar-2-custom-sidebar-editor`);
    cy.get('.dropup > .btn-submit').click();
    cy.get('body').should('not.have.class', 'on-edit');
    cy.screenshot(`${ssPrefix}custom-sidebar-3-custom-sidebar-created`);
  });

  it('Successfully performed page operation from "page tree"', () => {
    cy.visit('/');
    cy.getByTestid('grw-sidebar-nav-primary-page-tree').click();
    cy.screenshot(`${ssPrefix}page-tree-1-access-to-page-tree`);
    cy.get('.grw-pagetree-triangle-btn').eq(0).click();
    cy.screenshot(`${ssPrefix}page-tree-2-hide-page-tree-item`);
    cy.get('.grw-pagetree-triangle-btn').eq(0).click();

    cy.get('.grw-pagetree-item-children').eq(0).within(() => {
      cy.getByTestid('open-page-item-control-btn').find('button').eq(0).invoke('css','display','block').click()
    });

    cy.screenshot(`${ssPrefix}page-tree-3-click-three-dots-menu`);
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      cy.getByTestid('add-remove-bookmark-btn').click();
    });
    cy.screenshot(`${ssPrefix}page-tree-4-add-bookmark`);


    cy.get('.grw-pagetree-item-children').eq(0).within(() => {
      cy.getByTestid('open-page-item-control-btn').find('button').eq(0).invoke('css','display','block').click()
    });
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      cy.getByTestid('open-page-duplicate-modal-btn').click();
    });

    cy.getByTestid('page-duplicate-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').type('_test');
      cy.screenshot(`${ssPrefix}page-tree-5-duplicate-page`);
      cy.get('.modal-header > button').click();
    });

    cy.get('.grw-pagetree-item-children').eq(0).within(() => {
      cy.getByTestid('open-page-item-control-btn').find('button').eq(0).invoke('css','display','block').click()
    });
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      cy.getByTestid('open-page-move-rename-modal-btn').click();
    });

    cy.get('.grw-pagetree-item-children').eq(0).within(() => {
      cy.get('.flex-fill > input').type('_newname');
    });

    cy.screenshot(`${ssPrefix}page-tree-6-rename-page`);
    cy.get('body').click(0,0);

    cy.get('.grw-pagetree-item-children').eq(0).within(() => {
      cy.getByTestid('open-page-item-control-btn').find('button').eq(0).invoke('css','display','block').click()
    });
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      cy.getByTestid('open-page-delete-modal-btn').click();
    });

    cy.getByTestid('page-delete-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}page-tree-7-delete-page`);
      cy.get('.modal-header > button').click();
    });

  });

  it('Successfully performed page operation from "Tags" ', () => {
    cy.visit('/');
    cy.getByTestid('grw-sidebar-nav-primary-tags').click();
    cy.screenshot(`${ssPrefix}tags-1-access-to-tags`);

    cy.get('.grw-container-convertible > div > .btn-primary').click({force: true});

    cy.screenshot(`${ssPrefix}tags-2-check-all-tags`);
    cy.getByTestid('grw-tags-list').within(() => {
      cy.get('ul').find('a').contains('test').click();
    });

    cy.screenshot(`${ssPrefix}tags-3-page-list-with-tag`);
    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === '/Sandbox'){
          cy.wrap($row).within(() => {
            cy.getByTestid('open-page-item-control-btn').click();
          });
        }
      });
    });
    cy.screenshot(`${ssPrefix}tags-4-tags-click-three-dots-menu`);

    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === '/Sandbox'){
          cy.wrap($row).within(() => {
            cy.getByTestid('open-page-duplicate-modal-btn').click();
          });
        }
      });
    });

    cy.getByTestid('page-duplicate-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').type('_screen');
    }).screenshot(`${ssPrefix}tags-5-duplicate-page-from-tags`);

    cy.getByTestid('page-duplicate-modal').should('be.visible').within(() => {
      cy.get('.modal-header > button').click();
    });

    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === '/Sandbox'){
          cy.wrap($row).within(() => {
            cy.getByTestid('open-page-item-control-btn').click();
          });
        }
      });
    });
    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === '/Sandbox'){
          cy.wrap($row).within(() => {
            cy.getByTestid('open-page-move-rename-modal-btn').click();
          });
        }
      });
    });

    cy.getByTestid('page-rename-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').clear().type('/vrt', {force: true});
    }).screenshot(`${ssPrefix}tags-6-rename-page-from-tag`);

    cy.getByTestid('page-rename-modal').should('be.visible').within(() => {
      cy.get('.modal-header > button').click();
    });

    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === '/Sandbox'){
          cy.wrap($row).within(() => {
            cy.getByTestid('open-page-item-control-btn').click();
          });
        }
      });
    });
    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === '/Sandbox'){
          cy.wrap($row).within(() => {
            cy.getByTestid('open-page-delete-modal-btn').click();
          });
        }
      });
    });
    cy.getByTestid('page-delete-modal').should('be.visible').screenshot(`${ssPrefix}tags-7-delete-page-from-tag`);

    cy.getByTestid('page-delete-modal').should('be.visible').within(() => {
      cy.get('.modal-header > button').click();
    });
  });

  it('Successfully access to My Drafts page', () => {
    cy.visit('/');
    cy.get('.grw-sidebar-nav-secondary-container').within(() => {
      cy.get('a[href*="/me/drafts"]').click();
    });
    cy.screenshot(`${ssPrefix}access-to-drafts-page`);
  });
  it('Successfully access to Growi Docs page', () => {
    cy.visit('/');
    cy.get('.grw-sidebar-nav-secondary-container').within(() => {
      cy.get('a[href*="https://docs.growi.org"]').then(($a) => {
        const url = $a.prop('href')
        cy.request(url).its('body').should('include', '</html>');
      });
    });
  });

  it('Successfully access to trash page', () => {
    cy.visit('/');
    cy.get('.grw-sidebar-nav-secondary-container').within(() => {
      cy.get('a[href*="/trash"]').click();
    });
    cy.screenshot(`${ssPrefix}access-to-trash-page`);
  });
});
