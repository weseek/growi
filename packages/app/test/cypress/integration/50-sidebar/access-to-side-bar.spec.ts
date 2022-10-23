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
  it('Successfully access recent changes side bar ', () => {
    cy.visit('/');
    cy.getByTestid('grw-sidebar-nav-primary-recent-changes').click();
    cy.getByTestid('grw-contextual-navigation-sub').then(($el) => {
      if($el.hasClass('d-none')){
        cy.getByTestid('grw-navigation-resize-button').click({force: true});
      }
    });

    cy.getByTestid('grw-recent-changes').should('be.visible');
    cy.get('.list-group-item').should('be.visible');

    // Avoid blackout misalignment
    cy.scrollTo('center');
    cy.screenshot(`${ssPrefix}recent-changes-1-page-list`);

    cy.get('#grw-sidebar-contents-wrapper').within(() => {
      cy.get('#recentChangesResize').click({force: true});
      cy.get('.list-group-item').should('be.visible');
    });

    // Avoid blackout misalignment
    cy.scrollTo('center');
    cy.screenshot(`${ssPrefix}recent-changes-2-switch-sidebar-size`);
  });

  it('Successfully create a custom sidebar page', () => {
    cy.visit('/');
    cy.getByTestid('grw-sidebar-nav-primary-custom-sidebar').click();
    cy.getByTestid('grw-contextual-navigation-sub').then(($el) => {
      if($el.hasClass('d-none')){
        cy.getByTestid('grw-navigation-resize-button').click({force: true});
      }
    });

    cy.getByTestid('grw-contextual-navigation-sub').screenshot(`${ssPrefix}custom-sidebar-1-click-on-custom-sidebar`);

    // create /Sidebar contents
    const content = '# HELLO \n ## Hello\n ### Hello';
    cy.get('.grw-sidebar-content-header.h5').find('a').click();
    cy.get('.CodeMirror textarea').type(content, {force: true});
    cy.screenshot(`${ssPrefix}custom-sidebar-2-custom-sidebar-editor`);
    cy.getByTestid('save-page-btn').click();
    cy.get('layout-root').should('not.have.class', 'editing');

    // What to do when UserUISettings is not saved in time
    cy.getByTestid('grw-sidebar-nav-primary-custom-sidebar').then(($el) => {
      if (!$el.hasClass('active')) {
        cy.wrap($el).click();
      }
    });

    cy.get('.grw-custom-sidebar-content').should('be.visible');
    cy.getByTestid('grw-contextual-navigation-sub').screenshot(`${ssPrefix}custom-sidebar-3-custom-sidebar-created`);
  });

  it('Successfully performed page operation from "page tree"', () => {
    cy.visit('/');
    cy.getByTestid('grw-sidebar-nav-primary-page-tree').click();
    cy.getByTestid('grw-contextual-navigation-sub').then(($el) => {
      if($el.hasClass('d-none')){
        cy.getByTestid('grw-navigation-resize-button').click({force: true});
      }
    });
    cy.getByTestid('grw-contextual-navigation-sub').screenshot(`${ssPrefix}page-tree-1-access-to-page-tree`);
    cy.get('.grw-pagetree-triangle-btn').eq(0).click();
    cy.getByTestid('grw-contextual-navigation-sub').screenshot(`${ssPrefix}page-tree-2-hide-page-tree-item`);
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
      cy.getByTestid('closable-text-input').type('_newname');
    });

    cy.getByTestid('grw-contextual-navigation-sub').screenshot(`${ssPrefix}page-tree-6-rename-page`);
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
    cy.getByTestid('grw-contextual-navigation-sub').then(($el) => {
      if($el.hasClass('d-none')){
        cy.getByTestid('grw-navigation-resize-button').click({force: true});
      }
    });
    cy.getByTestid('grw-contextual-navigation-sub').screenshot(`${ssPrefix}tags-1-access-to-tags`);

    cy.get('.grw-container-convertible > div > .btn-primary').click({force: true});

    // collapse sidebar
    cy.collapseSidebar(true);

    cy.screenshot(`${ssPrefix}tags-2-check-all-tags`);
  });

  it('Successfully access to My Drafts page', () => {
    cy.visit('/');
    cy.collapseSidebar(true);
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
    cy.collapseSidebar(true);
    cy.get('.grw-sidebar-nav-secondary-container').within(() => {
      cy.get('a[href*="/trash"]').click();
    });
    cy.screenshot(`${ssPrefix}access-to-trash-page`);
  });
});
