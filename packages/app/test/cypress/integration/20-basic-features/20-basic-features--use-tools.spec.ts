context('Switch Sidebar content', () => {
  const ssPrefix = 'switch-sidebar-content';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('PageTree is successfully shown', () => {
    cy.collapseSidebar(false);
    cy.visit('/page');
    cy.waitUntilSkeletonDisappear();

    cy.getByTestid('grw-sidebar-nav-primary-page-tree').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-pagetree-after-load`);
  });
});

context('Modal for page operation', () => {

  const ssPrefix = 'modal-for-page-operation-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it("PageCreateModal is shown and closed successfully", () => {
    cy.visit('/');
    cy.waitUntilSkeletonDisappear();

    cy.getByTestid('newPageBtn').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000) // Wait for animation to finish when the Create Page button is pressed

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}new-page-modal-opened`);
      cy.get('button.close').click();
    });

    cy.collapseSidebar(true, true);
    cy.screenshot(`${ssPrefix}page-create-modal-closed`);
  });

  it("Successfully Create Today's page", () => {
    const pageName = "Today's page";
    cy.visit('/');
    cy.waitUntilSkeletonDisappear();

    cy.getByTestid('newPageBtn').click();

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.page-today-input2').type(pageName);
      cy.screenshot(`${ssPrefix}today-add-page-name`);
      cy.getByTestid('btn-create-memo').click();
    });
    cy.getByTestid('page-editor').should('be.visible');
    cy.getByTestid('save-page-btn').click();
    cy.get('.layout-root').should('not.have.class', 'editing');

    cy.getByTestid('grw-contextual-sub-nav').should('be.visible');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(300);

    // Do not use "cy.waitUntilSkeletonDisappear()"
    cy.get('.grw-skeleton').should('not.exist');

    cy.collapseSidebar(true, true);
    cy.screenshot(`${ssPrefix}create-today-page`);
  });

  it('Successfully create page under specific path', () => {
    const pageName = 'child';

    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.getByTestid('newPageBtn').click();

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').should('have.value', '/Sandbox/');
      cy.get('.rbt-input-main').type(pageName);
      cy.screenshot(`${ssPrefix}under-path-add-page-name`);
      cy.getByTestid('btn-create-page-under-below').click();
    });
    cy.getByTestid('page-editor').should('be.visible');
    cy.getByTestid('save-page-btn').click();
    cy.get('.layout-root').should('not.have.class', 'editing');

    cy.getByTestid('grw-contextual-sub-nav').should('be.visible');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(300);

    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}create-page-under-specific-page`);
  });

  it('Trying to create template page under the root page fail', () => {
    cy.visit('/');
    cy.waitUntilSkeletonDisappear();

    cy.getByTestid('newPageBtn').click();

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {

      cy.getByTestid('grw-page-create-modal-path-name').should('have.text', '/');

      cy.get('#template-type').click();
      cy.get('#template-type').next().find('button:eq(0)').click({force: true});
      cy.getByTestid('grw-btn-edit-page').should('be.visible').click();
    });
    cy.get('.toast-error').should('be.visible').invoke('attr', 'style', 'opacity: 1');
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}create-template-for-children-error`);
    cy.get('.toast-error').should('be.visible').click();
    cy.get('.toast-error').should('not.exist');

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('#template-type').click();
      cy.get('#template-type').next().find('button:eq(1)').click({force: true});
      cy.getByTestid('grw-btn-edit-page').should('be.visible').click();
    });
    cy.get('.toast-error').should('be.visible').invoke('attr', 'style', 'opacity: 1');
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}create-template-for-descendants-error`);
  });

  it('Page Deletion and PutBack is executed successfully', { scrollBehavior: false }, () => {
    cy.visit('/Sandbox/Bootstrap4');
    cy.waitUntilSkeletonDisappear();

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-page-delete-modal-btn').click({force: true});
    });

    cy.getByTestid('page-delete-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}-delete-modal`);
      cy.getByTestid('delete-page-button').click();
    });
    cy.getByTestid('trash-page-alert').should('be.visible');
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-bootstrap4-is-in-garbage-box`);

    cy.getByTestid('put-back-button').click();
    cy.getByTestid('put-back-page-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}-put-back-modal`);
      cy.getByTestid('put-back-execution-button').should('be.visible').click();
    });

    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-put-backed-bootstrap4-page`);
  });

  it('PageDuplicateModal is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4');
    cy.waitUntilSkeletonDisappear();

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-page-duplicate-modal-btn').click({force: true});
    });

    cy.getByTestid('page-duplicate-modal').should('be.visible').screenshot(`${ssPrefix}-duplicate-bootstrap4`);
  });

  it('PageMoveRenameModal is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4');
    cy.waitUntilSkeletonDisappear();

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-page-move-rename-modal-btn').click({force: true});
    });

    cy.getByTestid('grw-page-rename-button').should('be.disabled');

    cy.getByTestid('page-rename-modal').should('be.visible').screenshot(`${ssPrefix}-rename-bootstrap4`);
  });

});


// TODO: Uncomment after https://redmine.weseek.co.jp/issues/103121 is resolved
// context('Open presentation modal', () => {

//   const ssPrefix = 'access-to-presentation-modal-';

//   beforeEach(() => {
//     // login
//     cy.fixture("user-admin.json").then(user => {
//       cy.login(user.username, user.password);
//     });
//     cy.collapseSidebar(true);
//   });

//   it('PresentationModal for "/" is shown successfully', () => {
//     cy.visit('/');

//     cy.get('#grw-subnav-container').within(() => {
//       cy.getByTestid('open-page-item-control-btn').click({force: true});
//       cy.getByTestid('open-presentation-modal-btn').click({force: true});
//     });

//     // eslint-disable-next-line cypress/no-unnecessary-waiting
//     cy.wait(1500);
//     cy.screenshot(`${ssPrefix}-open-top`);
//   });

// });

context('Page Accessories Modal', () => {

  const ssPrefix = 'access-to-page-accessories-modal';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('Page History is shown successfully', () => {
     cy.visit('/Sandbox/Bootstrap4');
     cy.waitUntilSkeletonDisappear();

     cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').within(() => {
        cy.get('button.btn-page-item-control').click({force: true});
      });
      cy.getByTestid('open-page-accessories-modal-btn-with-history-tab').click({force: true});
    });

     cy.getByTestid('page-history').should('be.visible');
     cy.collapseSidebar(true);
     cy.screenshot(`${ssPrefix}-open-page-history-bootstrap4`);
  });

  it('Page Attachment Data is shown successfully', () => {
     cy.visit('/Sandbox/Bootstrap4');
     cy.waitUntilSkeletonDisappear();

     cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').within(() => {
        cy.get('button.btn-page-item-control').click({force: true});
      });
      cy.getByTestid('open-page-accessories-modal-btn-with-attachment-data-tab').click({force: true});
    });

     cy.getByTestid('page-attachment').should('be.visible').contains('No attachments yet.');

     cy.collapseSidebar(true);
     cy.screenshot(`${ssPrefix}-open-page-attachment-data-bootstrap4`);
  });

  it('Share Link Management is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4');
    cy.waitUntilSkeletonDisappear();

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').within(() => {
        cy.get('button.btn-page-item-control').click({force: true});
      });
      cy.getByTestid('open-page-accessories-modal-btn-with-share-link-management-data-tab').should('be.visible');
      cy.getByTestid('open-page-accessories-modal-btn-with-share-link-management-data-tab').click();
   });

   cy.getByTestid('page-accessories-modal').should('be.visible');
   cy.getByTestid('share-link-management').should('be.visible');

   cy.collapseSidebar(true);
   cy.screenshot(`${ssPrefix}-open-share-link-management-bootstrap4`);
  });
});

context('Tag Oprations', { scrollBehavior: false }, () =>{

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('Successfully add new tag', () => {
    const ssPrefix = 'tag-operations-add-new-tag-'
    const tag = 'we';

    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();

    cy.get('#edit-tags-btn-wrapper-for-tooltip > a').should('be.visible');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200);
    cy.get('#edit-tags-btn-wrapper-for-tooltip > a').click();
    cy.get('#edit-tag-modal').should('be.visible').screenshot(`${ssPrefix}1-edit-tag-input`);

    cy.get('#edit-tag-modal').within(() => {
      cy.get('.rbt-input-main').type(tag, {force: true});
      cy.get('#tag-typeahead-asynctypeahead').should('be.visible');
      cy.get('#tag-typeahead-asynctypeahead-item-0').should('be.visible');
      cy.screenshot(`${ssPrefix}2-type-tag-name`);
    });

    cy.get('#edit-tag-modal').within(() => {
      cy.get('#tag-typeahead-asynctypeahead').should('be.visible');
      cy.get('#tag-typeahead-asynctypeahead-item-0').should('be.visible');
      cy.get('a#tag-typeahead-asynctypeahead-item-0').click({force: true})
      cy.screenshot(`${ssPrefix}3-insert-tag-name`);
    });

    cy.get('#edit-tag-modal').within(() => {
      cy.get('div.modal-footer > button').click();
    });

    cy.get('.toast').should('be.visible').trigger('mouseover');
    cy.get('.grw-taglabels-container > .grw-tag-labels > a').contains(tag).should('exist');
    /* eslint-disable cypress/no-unnecessary-waiting */
    cy.wait(150); // wait for toastr to change its color occured by mouseover
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}4-click-done`);
  });

  it('Successfully duplicate page by generated tag', () => {
    const ssPrefix = 'tag-operations-page-duplicate-';
    const tag = 'we';
    const newPageName = 'our';

    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();

    cy.get('.grw-tag-label').should('be.visible').contains(tag).click();

    // Search result page
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content', { timeout: 60000 }).should('be.visible');
    cy.get('#revision-loader', { timeout: 60000 }).contains('Table of Contents', { timeout: 60000 });

    // force to add 'active' to pass VRT: https://github.com/weseek/growi/pull/6603
    cy.getByTestid('page-list-item-L').first().invoke('addClass', 'active');
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}1-click-tag-name`);
    cy.getByTestid('search-result-list').should('be.visible').then(($el)=>{
      cy.wrap($el).within(()=>{
        cy.getByTestid('open-page-item-control-btn').first().click();
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1500); // for wait rendering pagelist info
      cy.collapseSidebar(true);
      cy.screenshot(`${ssPrefix}2-click-three-dots-menu`);

      cy.wrap($el).within(()=>{
        cy.getByTestid('open-page-item-control-btn').first().within(()=>{
          cy.getByTestid('open-page-duplicate-modal-btn').click();
        })
      });
    })

    cy.getByTestid('page-duplicate-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').type(`-${newPageName}`, {force: true});
    }).screenshot(`${ssPrefix}3-duplicate-page`);

    cy.getByTestid('page-duplicate-modal').within(() => {
      cy.intercept('POST', '/_api/v3/pages/duplicate').as('duplicate');
      cy.get('.modal-footer > button.btn').click();
      // Wait for completion of request to '/_api/v3/pages/duplicate'
      cy.wait('@duplicate')
    });

    cy.visit(`Sandbox-${newPageName}`);
    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}4-duplicated-page`);
  });

  it('Successfully rename page from generated tag', () => {
    const ssPrefix = 'tag-operations-page-rename-';
    const tag = 'we';
    const oldPageName = '/Sandbox-our';
    const newPageName = '/Sandbox-us';

    cy.visit(oldPageName);
    cy.waitUntilSkeletonDisappear();

    cy.get('.grw-tag-label').should('be.visible').contains(tag).click();

    // Search result page
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content', { timeout: 60000 }).should('be.visible');
    cy.get('#revision-loader', { timeout: 60000 }).contains('Table of Contents', { timeout: 60000 });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(300);
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}1-click-tag-name`);

    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === oldPageName){
          cy.wrap($row).within(() => {
            cy.getByTestid('open-page-item-control-btn').first().click();
            cy.getByTestid('page-item-control-menu').should('have.class', 'show').then(() => {
              // empty sentence in page list empty: https://github.com/weseek/growi/pull/6880
              cy.getByTestid('revision-short-body-in-page-list-item-L').invoke('text', '');
            });

            cy.getByTestid('page-item-control-menu').within(()=>{
              cy.getByTestid('open-page-delete-modal-btn');
              cy.screenshot(`${ssPrefix}2-open-page-item-control-menu`);
            })
          });
        }
      });
    });

    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === oldPageName){
          cy.wrap($row).within(() => {
            cy.getByTestid('open-page-move-rename-modal-btn').click({force: true});
          });
        }
      });
    });

    cy.getByTestid('page-rename-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').clear().type(newPageName,{force: true});
    }).screenshot(`${ssPrefix}3-insert-new-page-name`);

    cy.getByTestid('page-rename-modal').should('be.visible').within(() => {
      cy.intercept('PUT', '/_api/v3/pages/rename').as('rename');
      cy.getByTestid('grw-page-rename-button').should('not.be.disabled').click();
      // Wait for completion of request to '/_api/v3/pages/rename'
      cy.wait('@rename')
    });

    cy.visit(newPageName);
    cy.waitUntilSkeletonDisappear();

    cy.getByTestid('grw-tag-labels').should('be.visible')
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}4-new-page-name-applied`);
  });
});

context('Shortcuts', () => {
  const ssPrefix = 'shortcuts';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('Successfully updating a page using a shortcut on a previously created page', { scrollBehavior: false }, () => {
    const body1 = 'hello';
    const body2 = 'world';
    const savePageShortcutKey = '{ctrl+s}'

    cy.visit('/Sandbox/child#edit');
    cy.waitUntilSkeletonDisappear();

    cy.get('.layout-root').should('have.class', 'editing');
    cy.get('.grw-editor-navbar-bottom').should('be.visible');

    // 1st
    cy.get('.CodeMirror').type(body1);
    cy.get('.CodeMirror').contains(body1);
    cy.get('.page-editor-preview-body').contains(body1);
    cy.get('.CodeMirror').type(savePageShortcutKey);

    cy.get('.Toastify__close-button').should('be.visible').click();
    cy.get('.Toastify').should('not.be.visible');
    cy.screenshot(`${ssPrefix}-update-page-1`);

    // 2nd
    cy.get('.CodeMirror').type(body2);
    cy.get('.CodeMirror').contains(body2);
    cy.get('.page-editor-preview-body').contains(body2);
    cy.get('.CodeMirror').type(savePageShortcutKey);

    cy.get('.Toastify__close-button').should('be.visible').click();
    cy.get('.Toastify').should('not.be.visible');
    cy.screenshot(`${ssPrefix}-update-page-2`);
  });
});
