context('Switch Sidebar content', () => {
  const ssPrefix = 'switch-sidebar-content';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('PageTree is successfully shown', () => {
    cy.visit('/page');
    cy.getByTestid('grw-sidebar-nav-primary-page-tree').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-pagetree-after-load`, { capture: 'viewport' });
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

  it("PageCreateModal is shown successfully", () => {
    cy.visit('/me');

    cy.getByTestid('newPageBtn').click();

    cy.getByTestid('page-create-modal').should('be.visible').screenshot(`${ssPrefix}-open`);

    cy.getByTestid('row-create-page-under-below').find('input.form-control').clear().type('/new-page');
    cy.getByTestid('btn-create-page-under-below').click();

    cy.getByTestid('page-editor').should('be.visible');
    cy.screenshot(`${ssPrefix}-create-clicked`, {capture: 'viewport'});
  });

  it('PageDeleteModal is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4');

     cy.get('#grw-subnav-container').within(() => {
       cy.getByTestid('open-page-item-control-btn').click();
       cy.getByTestid('open-page-delete-modal-btn').click();
    });

     cy.getByTestid('page-delete-modal').should('be.visible').screenshot(`${ssPrefix}-delete-bootstrap4`);
  });

  it('PageDuplicateModal is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4', {  });

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click();
      cy.getByTestid('open-page-duplicate-modal-btn').click();
    });

    cy.getByTestid('page-duplicate-modal').should('be.visible').screenshot(`${ssPrefix}-duplicate-bootstrap4`);
  });

  it('PageMoveRenameModal is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4', {  });

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click();
      cy.getByTestid('open-page-move-rename-modal-btn').click({force: true});
    });

    cy.getByTestid('page-rename-modal').should('be.visible').screenshot(`${ssPrefix}-rename-bootstrap4`);
  });

});


context('Open presentation modal', () => {

  const ssPrefix = 'access-to-presentation-modal-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('PresentationModal for "/" is shown successfully', () => {
    cy.visit('/');

    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click({force: true});
      cy.getByTestid('open-presentation-modal-btn').click({force: true});
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}-open-top`);
  });

});

context('Page Accessories Modal', () => {

  const ssPrefix = 'access-to-page-accessories-modal';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('Page History is shown successfully', () => {
     cy.visit('/Sandbox/Bootstrap4', {  });
     cy.get('#grw-subnav-container').within(() => {
       cy.getByTestid('open-page-item-control-btn').click();
       cy.getByTestid('open-page-accessories-modal-btn-with-history-tab').click();
    });

     cy.getByTestid('page-accessories-modal').should('be.visible')
     cy.getByTestid('page-history').should('be.visible')
     cy.screenshot(`${ssPrefix}-open-page-history-bootstrap4`);
  });
  it('Page Attachment Data is shown successfully', () => {
     cy.visit('/Sandbox/Bootstrap4', {  });
     cy.get('#grw-subnav-container').within(() => {
       cy.getByTestid('open-page-item-control-btn').click();
       cy.getByTestid('open-page-accessories-modal-btn-with-attachment-data-tab').click();
    });

     cy.getByTestid('page-accessories-modal').should('be.visible')
     cy.getByTestid('page-attachment').should('be.visible')
     cy.screenshot(`${ssPrefix}-open-page-attachment-data-bootstrap4`);
  });
  it('Share Link Management is shown successfully', () => {
    cy.visit('/Sandbox/Bootstrap4', { });
    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click();
      cy.getByTestid('open-page-accessories-modal-btn-with-share-link-management-data-tab').click();
   });

   cy.getByTestid('page-accessories-modal').should('be.visible');
   cy.getByTestid('share-link-management').should('be.visible');
   cy.screenshot(`${ssPrefix}-open-share-link-management-bootstrap4`);
  });

});

context('Tag Oprations', () =>{

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('Successfully add new tag', () => {
    const ssPrefix = 'tag-operations-add-new-tag-'
    const tag = 'we';
    cy.visit('/');

    cy.get('#edit-tags-btn-wrapper-for-tooltip > a').click({force: true});
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
      cy.screenshot(`${ssPrefix}3-insert-tag-name`, {capture: 'viewport'});
    });

    cy.get('#edit-tag-modal').within(() => {
      cy.get('div.modal-footer > button').click();
    });

    cy.get('.grw-taglabels-container > form > a').contains(tag).should('exist');

    cy.screenshot(`${ssPrefix}4-click-done`, {capture: 'viewport'});

  });

  it('Successfully duplicate page by generated tag', () => {
    const ssPrefix = 'tag-operations-page-duplicate-';
    const tag = 'we';
    const newPageName = 'our';
    cy.visit('/');
    cy.get('.grw-taglabels-container > form > a').contains(tag).click();
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-revision-renderer').should('be.visible');
    cy.screenshot(`${ssPrefix}1-click-tag-name`, {capture: 'viewport'});

    cy.getByTestid('open-page-item-control-btn').first().click({force: true});
    cy.screenshot(`${ssPrefix}2-click-three-dots-menu`, {capture: 'viewport'});

    cy.getByTestid('open-page-duplicate-modal-btn').first().click({force: true});
    cy.getByTestid('page-duplicate-modal').should('be.visible');
    cy.getByTestid('page-duplicate-modal').within(() => {
      cy.get('.rbt-input-main').type(newPageName, {force: true});
    }).screenshot(`${ssPrefix}3-duplicate-page`, {capture: 'viewport'});

    cy.getByTestid('page-duplicate-modal').within(() => {
      cy.get('.modal-footer > button.btn').click();
    });
    cy.visit(`/${newPageName}`);
    cy.get('#wiki').should('not.be.empty');
    cy.screenshot(`${ssPrefix}4-duplicated-page`, {capture: 'viewport'});
  });

  it('Successfully rename page from generated tag', () => {
    const ssPrefix = 'tag-operations-page-rename-';
    const tag = 'we';
    const oldPageName = '/our';
    const newPageName = '/ourus';

    cy.visit('/');
    cy.get('.grw-taglabels-container > form > a').contains(tag).click();
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.screenshot(`${ssPrefix}1-click-tag-name`, {capture: 'viewport'});

    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === oldPageName){
          cy.wrap($row).within(() => {
            cy.getByTestid('open-page-item-control-btn').click();
          });
        }
      });
    });
    cy.screenshot(`${ssPrefix}2-click-three-dots-menu`, {capture: 'viewport'});

    cy.getByTestid('search-result-list').within(() => {
      cy.get('.list-group-item').each(($row) => {
        if($row.find('a').text() === oldPageName){
          cy.wrap($row).within(() => {
            cy.getByTestid('open-page-move-rename-modal-btn').click();
          });
        }
      });
    });

    cy.getByTestid('page-rename-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').clear().type(newPageName,{force: true});
    }).screenshot(`${ssPrefix}3-insert-new-page-name`);

    cy.getByTestid('page-rename-modal').should('be.visible').within(() => {
      cy.get('.modal-footer > button').click();
    });

    cy.visit(`/${newPageName}`);
    cy.screenshot(`${ssPrefix}4-new-page-name-applied`, {capture: 'viewport'});
  });

});
