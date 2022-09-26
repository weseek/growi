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
    cy.get('#wiki').should('be.visible');
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');
    cy.screenshot(`${ssPrefix}with-q`);
  });

  it('checkboxes behaviors', () => {
    cy.visit('/_search', { qs: { q: 'labels alerts cards blocks' } });

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('#wiki').should('be.visible');
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');

    // force to add 'active' to pass VRT: https://github.com/weseek/growi/pull/6603
    cy.getByTestid('page-list-item-L').first().invoke('addClass', 'active');

    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}the-first-checkbox-on`);
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}the-first-checkbox-off`);

    // click select all checkbox
    cy.getByTestid('cb-select-all').click({force: true});
    cy.screenshot(`${ssPrefix}the-select-all-checkbox-1`);
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}the-select-all-checkbox-2`);
    cy.getByTestid('cb-select').first().click({force: true});
    cy.screenshot(`${ssPrefix}the-select-all-checkbox-3`);
    cy.getByTestid('cb-select-all').click({force: true});
    cy.screenshot(`${ssPrefix}the-select-all-checkbox-4`);
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
    cy.getByTestid('search-result-private-legacy-pages').should('be.visible');

    cy.screenshot(`${ssPrefix}shown`);
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

    cy.visit('/');
    cy.get('.rbt-input').click();
    cy.get('.rbt-menu.dropdown-menu.show').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}1-search-input-focused`);
    })

    cy.get('.rbt-input-main').type(`${searchText}`);
    cy.screenshot(`${ssPrefix}2-insert-search-text`, { capture: 'viewport'});
    cy.get('.rbt-input-main').type('{enter}');


    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('#wiki').should('be.visible');
    // force to add 'active' to pass VRT: https://github.com/weseek/growi/pull/6603
    cy.getByTestid('page-list-item-L').first().invoke('addClass', 'active');
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}3-search-page-results`, { capture: 'viewport'});

    cy.getByTestid('open-page-item-control-btn').eq(1).click();
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('#wiki').should('be.visible');
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');
    cy.screenshot(`${ssPrefix}4-click-three-dots-menu`, {capture: 'viewport'});

    //Add bookmark
    cy.getByTestid('add-remove-bookmark-btn').click({force: true});
    cy.get('.btn-bookmark.active').should('be.visible');
    cy.screenshot(`${ssPrefix}5-add-bookmark`, {capture: 'viewport'});

    // Duplicate page
    cy.getByTestid('open-page-duplicate-modal-btn').first().click({force: true});
    cy.getByTestid('page-duplicate-modal').should('be.visible');
    cy.screenshot(`${ssPrefix}6-duplicate-page`, {capture: 'viewport'});

    // Close Modal
    cy.get('body').type('{esc}');

    // Move / Rename Page
    cy.getByTestid('open-page-move-rename-modal-btn').first().click({force: true});
    cy.getByTestid('page-rename-modal').should('be.visible');
    cy.screenshot(`${ssPrefix}7-move-rename-page`, {capture: 'viewport'});

    // Close Modal
    cy.get('body').type('{esc}');

    // Delete page
    cy.getByTestid('open-page-delete-modal-btn').first().click({ force: true});
    cy.getByTestid('page-delete-modal').should('be.visible');
    cy.screenshot(`${ssPrefix}8-delete-page`, {capture: 'viewport'});
  });

  it(`Search all pages by tag is successfully loaded `, () => {
    const tag = 'help';
    const searchText = `tag:${tag}`;
    cy.visit('/');
    // Add tag
    cy.get('#edit-tags-btn-wrapper-for-tooltip > a').click({force: true});
    cy.get('#edit-tag-modal').should('be.visible');

    cy.get('#edit-tag-modal').within(() => {
      cy.get('.rbt-input-main').type(tag);
      cy.get('#tag-typeahead-asynctypeahead').should('be.visible');
      cy.get('#tag-typeahead-asynctypeahead-item-0').should('be.visible');
      cy.get('a#tag-typeahead-asynctypeahead-item-0').click({force: true})
    });

    cy.get('#edit-tag-modal').within(() => {
      cy.get('div.modal-footer > button').click();
    });

    cy.visit('/');
    cy.get('.rbt-input').click();
    cy.get('.rbt-input-main').type(`${searchText}`);
    cy.screenshot(`${ssPrefix}1-insert-search-text-with-tag`, { capture: 'viewport'});
    cy.get('.rbt-input-main').type('{enter}');

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('#wiki').should('be.visible');
    // force to add 'active' to pass VRT: https://github.com/weseek/growi/pull/6603
    cy.getByTestid('page-list-item-L').first().invoke('addClass', 'active');
    cy.screenshot(`${ssPrefix}2-search-with-tag-result`, {capture: 'viewport'});

    cy.getByTestid('open-page-item-control-btn').first().click();
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('#wiki').should('be.visible');
    cy.screenshot(`${ssPrefix}3-click-three-dots-menu-search-with-tag`, {capture: 'viewport'});

  });

  it('Successfully order page search results by tag', () => {
    const tag = 'help';

    cy.visit('/');
    cy.get('.grw-taglabels-container > form > a').contains(tag).click();
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('#wiki').should('be.visible');
    // force to add 'active' to pass VRT: https://github.com/weseek/growi/pull/6603
    cy.getByTestid('page-list-item-L').first().invoke('addClass', 'active');
    cy.screenshot(`${ssPrefix}1-tag-order-click-tag-name`, {capture: 'viewport'});

    cy.get('.grw-search-page-nav').within(() => {
      cy.get('button.dropdown-toggle').first().click({force: true});
      cy.get('.dropdown-menu-right').should('be.visible');
      cy.get('.dropdown-menu-right > button:nth-child(1)').click({force: true});
    });
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('#wiki').should('be.visible');
    cy.screenshot(`${ssPrefix}2-tag-order-by-relevance`);

    cy.get('.grw-search-page-nav').within(() => {
      cy.get('button.dropdown-toggle').first().click({force: true});
      cy.get('.dropdown-menu-right').should('be.visible');
      cy.get('.dropdown-menu-right > button:nth-child(2)').click({force: true});
    });
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('#wiki').should('be.visible');
    cy.screenshot(`${ssPrefix}3-tag-order-by-creation-date`);

    cy.get('.grw-search-page-nav').within(() => {
      cy.get('button.dropdown-toggle').first().click({force: true});
      cy.get('.dropdown-menu-right').should('be.visible');
      cy.get('.dropdown-menu-right > button:nth-child(3)').click({force: true});
    });
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('#wiki').should('be.visible');
    cy.screenshot(`${ssPrefix}4-tag-order-by-last-update-date`);
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
      cy.screenshot(`${ssPrefix}1-search-input-focused`);
    })
    cy.get('.rbt-input').type(`${searchText}`);
    cy.screenshot(`${ssPrefix}2-insert-search-text`, { capture: 'viewport'});
    cy.get('.rbt-input').type('{enter}');

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('#wiki').should('be.visible');
    // force to add 'active' to pass VRT: https://github.com/weseek/growi/pull/6603
    cy.getByTestid('page-list-item-L').first().invoke('addClass', 'active');
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500);
    cy.screenshot(`${ssPrefix}3-search-page-results`, { capture: 'viewport'});

    cy.getByTestid('open-page-item-control-btn').first().click();
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('#wiki').should('be.visible');
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');
    cy.screenshot(`${ssPrefix}4-click-three-dots-menu`, {capture: 'viewport'});
  });

});
