context('Access to search result page', () => {
  const ssPrefix = 'access-to-result-page-directly-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('/_search with "q" param is successfully loaded', () => {
    cy.visit('/_search', { qs: { q: 'labels alerts cards blocks' } });

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');

    cy.screenshot(`${ssPrefix}-with-q`);
  });

  it('checkboxes behaviors', () => {
    cy.visit('/_search', { qs: { q: 'labels alerts cards blocks' } });

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');

    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-first-checkbox-on`);
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-first-checkbox-off`);

    // click select all checkbox
    cy.getByTestid('cb-select-all').click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-1`);
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-2`);
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-3`);
    cy.getByTestid('cb-select-all').click({force: true});
    cy.screenshot(`${ssPrefix}-the-select-all-checkbox-4`);
  });

});



context('Access to legacy private pages', () => {
  const ssPrefix = 'access-to-legacy-private-pages-directly-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('/_private-legacy-pages is successfully loaded', () => {
    cy.visit('/_private-legacy-pages');

    cy.getByTestid('search-result-base').should('be.visible');

    cy.screenshot(`${ssPrefix}-shown`);
  });

});

context('Search all pages', () => {
  const ssPrefix = 'search-all-pages-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it(`Search all pages by word is successfully loaded`, () => {
    const searchText = 'help';
    const tag = 'help'
    cy.visit('/Sandbox');
    // Add tag
    cy.get('#edit-tags-btn-wrapper-for-tooltip > a').click({force: true});
    cy.get('#edit-tag-modal').should('be.visible');

    cy.get('#edit-tag-modal').within(() => {
      cy.get('.rbt-input-main').type(tag).trigger('change');
      cy.get('#tag-typeahead-asynctypeahead').should('be.visible');
      cy.get('#tag-typeahead-asynctypeahead-item-0').should('be.visible');
      cy.get('a#tag-typeahead-asynctypeahead-item-0').click({force: true})
    });

    cy.get('#edit-tag-modal').within(() => {
      cy.get('div.modal-footer > button').click();
    });

    // Access "/Sandbox" instead of "/", because "/"" can't be renamed (test rename page modal)
    cy.visit('/Sandbox');
    cy.get('.rbt-input').click();
    cy.get('.rbt-menu.dropdown-menu.show').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}search-input-focused`);
    })

    cy.get('.rbt-input-main').type(`${searchText}`);
    cy.screenshot(`${ssPrefix}insert-search-text`, { capture: 'viewport'});
    cy.get('.rbt-input-main').type('{enter}');
    cy.screenshot(`${ssPrefix}press-enter`, { capture: 'viewport'});

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');

    cy.getByTestid('open-page-item-control-btn').first().click();
    cy.screenshot(`${ssPrefix}click-three-dots-menu`, {capture: 'viewport'});

    //Add bookmark
    cy.getByTestid('add-remove-bookmark-btn').first().click({force: true});
    cy.get('.btn-bookmark.active').should('be.visible');
    cy.screenshot(`${ssPrefix}add-bookmark`, {capture: 'viewport'});

    // Duplicate page
    cy.getByTestid('open-page-duplicate-modal-btn').first().click({force: true});
    cy.getByTestid('page-duplicate-modal').should('be.visible');
    cy.screenshot(`${ssPrefix}duplicate-page`, {capture: 'viewport'});

    // Close Modal
    cy.get('body').type('{esc}');

    // Move / Rename Page
    cy.getByTestid('open-page-move-rename-modal-btn').first().click({force: true});
    cy.getByTestid('page-rename-modal').should('be.visible');
    cy.screenshot(`${ssPrefix}move-rename-page`, {capture: 'viewport'});

    // Close Modal
    cy.get('body').type('{esc}');

    // Delete page
    cy.getByTestid('open-page-delete-modal-btn').first().click({ force: true});
    cy.getByTestid('page-delete-modal').should('be.visible');
    cy.screenshot(`${ssPrefix}delete-page`, {capture: 'viewport'});
  });

  it(`Search all pages by tag is successfully loaded `, () => {
    const tag = 'help';
    const searchText = `tag:${tag}`;

    cy.visit('/');
    cy.get('.rbt-input').click();
    cy.get('.rbt-input-main').type(`${searchText}`);
    cy.screenshot(`${ssPrefix}insert-search-text-with-tag`, { capture: 'viewport'});
    cy.get('.rbt-input-main').type('{enter}');

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');

    cy.screenshot(`${ssPrefix}search-with-tag-result`, {capture: 'viewport'});
    cy.getByTestid('open-page-item-control-btn').first().click();
    cy.screenshot(`${ssPrefix}click-three-dots-menu-search-with-tag`, {capture: 'viewport'});

  });

});

context('Search current tree with "prefix":', () => {
  const ssPrefix = 'search-current-tree-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it(`Search current tree by word is successfully loaded`, () => {
    const searchText = 'help';
    cy.visit('/');
    cy.getByTestid('select-search-scope').first().click({force: true});
    cy.get('.input-group-prepend.show > div > button:nth-child(2)').click({force: true});
    cy.get('.rbt-input').click();
    cy.get('.rbt-menu.dropdown-menu.show').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}search-input-focused`);
    })
    cy.get('.rbt-input').type(`${searchText}`);
    cy.screenshot(`${ssPrefix}insert-search-text`, { capture: 'viewport'});
    cy.get('.rbt-input').type('{enter}');
    cy.screenshot(`${ssPrefix}press-enter`, { capture: 'viewport'});

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');

    cy.getByTestid('open-page-item-control-btn').first().click();
    cy.screenshot(`${ssPrefix}click-three-dots-menu`, {capture: 'viewport'});
  });

});
