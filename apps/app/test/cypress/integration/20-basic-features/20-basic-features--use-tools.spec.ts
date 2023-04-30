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

    cy.waitUntil(() => {
      // do
      cy.getByTestid('newPageBtn').click({force: true});
      // wait until
      return cy.getByTestid('page-create-modal').then($elem => $elem.is(':visible'));
    });

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

    cy.waitUntil(() => {
      // do
      cy.getByTestid('newPageBtn').click({force: true});
      // wait until
      return cy.getByTestid('page-create-modal').then($elem => $elem.is(':visible'));
    });

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.page-today-input2').type(pageName);
      cy.screenshot(`${ssPrefix}today-add-page-name`);
      cy.getByTestid('btn-create-memo').click();
    });

    cy.getByTestid('page-editor').should('be.visible');
    cy.getByTestid('save-page-btn').as('save-page-btn').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.get('@save-page-btn').click();
      // wait until
      return cy.get('@save-page-btn').then($elem => $elem.is(':disabled'));
    });
    cy.get('.layout-root').should('not.have.class', 'editing');

    cy.collapseSidebar(true);
    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}create-today-page`);
  });

  it('Successfully create page under specific path', () => {
    const pageName = 'child';

    cy.visit('/foo/bar');

    cy.waitUntil(() => {
      // do
      cy.getByTestid('newPageBtn').click({force: true});
      // wait until
      return cy.get('body').within(() => {
        return Cypress.$('[data-testid=page-create-modal]').is(':visible');
      });
    });

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').should('have.value', '/foo/bar/');
      cy.get('.rbt-input-main').type(pageName);
      cy.screenshot(`${ssPrefix}under-path-add-page-name`);
      cy.getByTestid('btn-create-page-under-below').click();
    });

    cy.getByTestid('page-editor').should('be.visible');
    cy.getByTestid('save-page-btn').as('save-page-btn').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.get('@save-page-btn').click();
      // wait until
      return cy.get('@save-page-btn').then($elem => $elem.is(':disabled'));
    });
    cy.get('.layout-root').should('not.have.class', 'editing');

    cy.getByTestid('grw-contextual-sub-nav').should('be.visible');

    cy.waitUntilSkeletonDisappear();
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}create-page-under-specific-page`);
  });

  it('Trying to create template page under the root page fail', () => {
    cy.visit('/');

    cy.waitUntil(() => {
      // do
      cy.getByTestid('newPageBtn').click({force: true});
      // wait until
      return cy.getByTestid('page-create-modal').then($elem => $elem.is(':visible'));
    });

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.getByTestid('grw-page-create-modal-path-name').should('have.text', '/');

      cy.get('#template-type').click();
      cy.get('#template-type').next().find('button:eq(0)').click({force: true});
      cy.getByTestid('grw-btn-edit-page').should('be.visible').click();
    });
    cy.get('.Toastify__toast').should('be.visible');
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}create-template-for-children-error`);
    cy.get('.Toastify__toast').should('be.visible').within(() => {
      cy.get('.Toastify__close-button').should('be.visible').click();
      cy.get('.Toastify__progress-bar').invoke('attr', 'style', 'display: none')
    });

    cy.getByTestid('page-create-modal').should('be.visible').within(() => {
      cy.get('#template-type').click();
      cy.get('#template-type').next().find('button:eq(1)').click({force: true});
      cy.getByTestid('grw-btn-edit-page').should('be.visible').click();
    });
    cy.get('.Toastify__toast').should('be.visible');
    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}create-template-for-descendants-error`);
  });

  it('Page Deletion and PutBack is executed successfully', { scrollBehavior: false }, () => {
    cy.visit('/Sandbox/Bootstrap4');

    cy.waitUntil(() => {
      // do
      cy.get('#grw-subnav-container').within(() => {
        cy.getByTestid('open-page-item-control-btn').find('button').click({force: true});
      });
      //wait until
      return cy.getByTestid('page-item-control-menu').then($elem => $elem.is(':visible'))
    });

    cy.getByTestid('open-page-delete-modal-btn').filter(':visible').click({force: true});

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

    cy.waitUntil(() => {
      // do
      cy.get('#grw-subnav-container').within(() => {
        cy.getByTestid('open-page-item-control-btn').find('button').click({force: true});
      });
      // wait until
      return cy.getByTestid('page-item-control-menu').then($elem => $elem.is(':visible'))
    });

    cy.getByTestid('open-page-duplicate-modal-btn').filter(':visible').click({force: true});

    cy.getByTestid('page-duplicate-modal').should('be.visible').screenshot(`${ssPrefix}-duplicate-bootstrap4`);
  });

  it('PageMoveRenameModal is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4');
    cy.waitUntilSkeletonDisappear();

    cy.waitUntil(() => {
      // do
      cy.get('#grw-subnav-container').within(() => {
        cy.getByTestid('open-page-item-control-btn').find('button').click({force: true});
      });
      // wait until
      return cy.getByTestid('page-item-control-menu').then($elem => $elem.is(':visible'))
    });

    cy.getByTestid('open-page-move-rename-modal-btn').filter(':visible').click({force: true});
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

    cy.visit('/');

    cy.waitUntil(() => {
      // do
      cy.getByTestid('grw-contextual-sub-nav').should('be.visible').within(() => {
        cy.getByTestid('open-page-item-control-btn').find('button').first().as('btn').click();
      });
      // wait until
      return cy.get('body').within(() => {
        return Cypress.$('.dropdown-menu.show').is(':visible');
      });
    });

  });

  it('Page History is shown successfully', () => {
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      cy.getByTestid('open-page-accessories-modal-btn-with-history-tab').click({force: true});
    });

    cy.getByTestid('page-history').should('be.visible');

    cy.collapseSidebar(true, true);
    cy.waitUntilSpinnerDisappear();
    cy.screenshot(`${ssPrefix}-open-page-history-bootstrap4`);
  });

  it('Page Attachment Data is shown successfully', () => {
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      cy.getByTestid('open-page-accessories-modal-btn-with-attachment-data-tab').click({force: true});
    });

    cy.waitUntilSpinnerDisappear();
    cy.getByTestid('page-attachment').should('be.visible').contains('No attachments yet.');

    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-open-page-attachment-data-bootstrap4`);
  });

  it('Share Link Management is shown successfully', () => {
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      cy.getByTestid('open-page-accessories-modal-btn-with-share-link-management-data-tab').click({force: true});
    });

    cy.waitUntilSpinnerDisappear();
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

    cy.visit('/Sandbox/Bootstrap4');

    // Add tag
    cy.get('#edit-tags-btn-wrapper-for-tooltip').as('edit-tag-tooltip').should('be.visible');

    // open Edit Tags Modal
    cy.waitUntil(() => {
      // do
      cy.get('@edit-tag-tooltip').find('a').click({force: true});
      // wait until
      return cy.get('#edit-tag-modal').then($elem => $elem.is(':visible'));
    });

    cy.collapseSidebar(true);
    cy.get('#edit-tag-modal').should('be.visible').screenshot(`${ssPrefix}1-edit-tag-input`);

    cy.get('#edit-tag-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').type(tag);
      cy.get('#tag-typeahead-asynctypeahead').should('be.visible');
      cy.get('#tag-typeahead-asynctypeahead-item-0').should('be.visible');
      // select
      cy.get('a#tag-typeahead-asynctypeahead-item-0').click();
      // save
      cy.get('div.modal-footer > button').click();
    });

    cy.get('.Toastify__toast').should('be.visible').trigger('mouseover');
    cy.get('.grw-taglabels-container > .grw-tag-labels > a').contains(tag).should('exist');

    cy.screenshot(`${ssPrefix}2-click-done`);
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
    const body2 = ' world!';
    const savePageShortcutKey = '{ctrl+s}';

    cy.visit('/Sandbox/child');

    cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.get('@pageEditorModeManager').within(() => {
        cy.get('button:nth-child(2)').click();
      });
      // until
      return cy.get('.layout-root').then($elem => $elem.hasClass('editing'));
    })

    cy.get('.grw-editor-navbar-bottom').should('be.visible');

    // 1st
    cy.get('.CodeMirror').type(body1);
    cy.get('.CodeMirror').contains(body1);
    cy.get('.page-editor-preview-body').contains(body1);
    cy.get('.CodeMirror').type(savePageShortcutKey);

    cy.get('.Toastify__toast').should('be.visible').within(() => {
      cy.get('.Toastify__close-button').should('be.visible').click();
      cy.get('.Toastify__progress-bar').invoke('attr', 'style', 'display: none')
    });
    cy.screenshot(`${ssPrefix}-update-page-1`);

    cy.get('.Toastify').should('not.be.visible');

    // 2nd
    cy.get('.CodeMirror').type(body2);
    cy.get('.CodeMirror').contains(body2);
    cy.get('.page-editor-preview-body').contains(body2);
    cy.get('.CodeMirror').type(savePageShortcutKey);

    cy.get('.Toastify__toast').should('be.visible').within(() => {
      cy.get('.Toastify__close-button').should('be.visible').click();
      cy.get('.Toastify__progress-bar').invoke('attr', 'style', 'display: none')
    });
    cy.screenshot(`${ssPrefix}-update-page-2`);
  });
});
