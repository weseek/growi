context('Access to search result page', () => {
  const ssPrefix = 'access-to-result-page-directly-';


  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('/_search with "q" param is successfully loaded', () => {
    cy.visit('/_search', { qs: { q: 'labels alerts cards blocks' } });

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('.wiki').should('be.visible');
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');

    cy.collapseSidebar(true, true);
    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}with-q`);
  });

  it('checkboxes behaviors', () => {
    cy.visit('/_search', { qs: { q: 'labels alerts cards blocks' } });

    cy.collapseSidebar(true);

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('.wiki').should('be.visible');
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
  });

  it('/_private-legacy-pages is successfully loaded', () => {
    cy.visit('/_private-legacy-pages');

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-private-legacy-pages').should('be.visible');

    cy.collapseSidebar(true);
    cy.waitUntilSkeletonDisappear();
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
  });

  it(`Search all pages by word is successfully loaded`, () => {
    const searchText = 'help';

    cy.visit('/');

    cy.collapseSidebar(true, true);
    cy.waitUntilSkeletonDisappear();

    cy.get('.rbt-input').click();
    cy.get('.rbt-menu.dropdown-menu.show').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}1-search-input-focused`);
    })

    cy.get('.rbt-input-main').type(`${searchText}`);
    cy.screenshot(`${ssPrefix}2-insert-search-text`, { capture: 'viewport'});
    cy.get('.rbt-input-main').type('{enter}');
  });

  it(`Search all pages by tag is successfully loaded `, () => {
    const tag = 'help';
    const searchText = `tag:${tag}`;

    cy.visit('/');

    // open Edit Tags Modal to add tag
    cy.waitUntil(() => {
      // do
      cy.getByTestid('grw-tag-labels').as('tagLabels').should('be.visible');
      cy.get('@tagLabels').find('a.btn').as('btn').click();
      // wait until
      return cy.get('body').within(() => {
        return Cypress.$('.modal.show').is(':visible');
      });
    });

    cy.get('#edit-tag-modal').should('be.visible').within(() => {
      cy.get('.rbt-input-main').type(tag);
      cy.get('#tag-typeahead-asynctypeahead').should('be.visible');
      cy.get('#tag-typeahead-asynctypeahead-item-0').should('be.visible');
      // select
      cy.get('a#tag-typeahead-asynctypeahead-item-0').click();
      // save
      cy.get('div.modal-footer > button').click();
    });

    cy.visit('/');

    cy.get('.rbt-input').should('be.visible');
    cy.get('.rbt-input').click();
    cy.get('.rbt-input-main').type(`${searchText}`);

    cy.collapseSidebar(true);
    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}1-insert-search-text-with-tag`, { capture: 'viewport'});

    cy.get('.rbt-input-main').type('{enter}');

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('.wiki').should('be.visible');

    // force to add 'active' to pass VRT: https://github.com/weseek/growi/pull/6603
    cy.getByTestid('page-list-item-L').first().invoke('addClass', 'active');

    cy.collapseSidebar(true);
    cy.waitUntilSpinnerDisappear();
    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}2-search-with-tag-result`, {capture: 'viewport'});

  });

  it('Successfully order page search results by tag', () => {
    const tag = 'help';

    cy.visit('/');

    // open Edit Tags Modal to add tag
    cy.waitUntil(() => {
      // do
      cy.getByTestid('grw-tag-labels').as('tagLabels').should('be.visible');
      cy.get('@tagLabels').find('a').contains(tag).as('tag').click();
      // wait until
      return cy.getByTestid('search-result-base').then($elem => $elem.is(':visible'));
    });

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('.wiki').should('be.visible');

    // force to add 'active' to pass VRT: https://github.com/weseek/growi/pull/6603
    cy.getByTestid('page-list-item-L').first().invoke('addClass', 'active');

    cy.collapseSidebar(true);
    cy.waitUntilSkeletonDisappear();
    cy.waitUntilSpinnerDisappear();
    cy.screenshot(`${ssPrefix}1-tag-order-click-tag-name`, {capture: 'viewport'});

  });

});

context('Sort with dropdown', () => {
  const ssPrefix = 'sort-with-dropdown-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });

    cy.visit('/_search', { qs: { q: 'sand' } });

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('.wiki').should('be.visible');

    cy.waitUntilSpinnerDisappear();
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');

    // open sort dropdown
    cy.waitUntil(() => {
      // do
      cy.get('.grw-search-page-nav').within(() => {
        cy.get('button.dropdown-toggle').first().click({force: true});
      });
      // wait until
      return cy.get('.grw-search-page-nav').within(() => {
        return Cypress.$('.dropdown-menu.show').is(':visible');
      });
    });
  });

  it('Open sort dropdown', () => {
    cy.get('.grw-search-page-nav .dropdown-menu.show').should('be.visible');
      cy.screenshot(`${ssPrefix}2-open-sort-dropdown`);
  });

  it('Sort by relevance', () => {
    cy.get('.grw-search-page-nav .dropdown-menu.show').should('be.visible').within(() => {
      cy.get('button:nth-child(1)').click({force: true});
    });
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('.wiki').should('be.visible');

    cy.waitUntilSpinnerDisappear();
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');
    cy.screenshot(`${ssPrefix}3-tag-order-by-relevance`);
  });

  it('Sort by creation date', () => {
    cy.get('.grw-search-page-nav .dropdown-menu.show').should('be.visible').within(() => {
      cy.get('button:nth-child(2)').click({force: true});
    });
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('.wiki').should('be.visible');

    cy.waitUntilSpinnerDisappear();
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');
    cy.screenshot(`${ssPrefix}3-tag-order-by-creation-date`);
  });

  it('Sort by last update date', () => {
    cy.get('.grw-search-page-nav .dropdown-menu.show').should('be.visible').within(() => {
      cy.get('button:nth-child(3)').click({force: true});
    });
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('.wiki').should('be.visible');

    cy.waitUntilSpinnerDisappear();
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');
    cy.screenshot(`${ssPrefix}4-tag-order-by-last-update-date`);
  });

});


context('Search and use', () => {
  const ssPrefix = 'search-and-use-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });

    cy.visit('/_search', { qs: { q: 'labels alerts cards blocks' } });
    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('.wiki').should('be.visible');

    cy.getByTestid('page-list-item-L').first().as('firstItem');

    // force to add 'active' to pass VRT: https://github.com/weseek/growi/pull/6603
    cy.get('@firstItem').invoke('addClass', 'active');
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');

    cy.waitUntil(() => {
      // do
      cy.get('@firstItem').within(() => {
        cy.getByTestid('open-page-item-control-btn').click();
      });
      // wait until
      return cy.get('.dropdown-menu.show').then($elem => $elem.is(':visible'));
    });
  });

  it('Successfully the dropdown is opened', () => {
    cy.get('.dropdown-menu.show').should('be.visible');
    cy.screenshot(`${ssPrefix}1-click-three-dots-menu`, {capture: 'viewport'});
  });

  it('Successfully add bookmark', () => {
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      // Add bookmark
      cy.getByTestid('add-remove-bookmark-btn').click({force: true});
    });
    cy.getByTestid('search-result-content').within(() => {
      cy.get('.btn-bookmark.active').should('be.visible');
    });
    cy.screenshot(`${ssPrefix}2-add-bookmark`, {capture: 'viewport'});
  });

  it('Successfully open duplicate modal', () => {
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      cy.getByTestid('open-page-duplicate-modal-btn').click({force: true});
    });
    cy.getByTestid('page-duplicate-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}3-duplicate-page`);
    });
    // Close Modal
    cy.get('body').type('{esc}');
  });

  it('Successfully open move/rename modal', () => {
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      cy.getByTestid('open-page-move-rename-modal-btn').click({force: true});
    });
    cy.getByTestid('page-rename-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}4-move-rename-page`);
    });
    // Close Modal
    cy.get('body').type('{esc}');
  });

  it('Successfully open delete modal', () => {
    cy.get('.dropdown-menu.show').should('be.visible').within(() => {
      cy.getByTestid('open-page-delete-modal-btn').click({ force: true});
    });
    cy.getByTestid('page-delete-modal').should('be.visible').within(() => {
      cy.screenshot(`${ssPrefix}5-delete-page`);
    });
  });
})

context('Search current tree with "prefix":', () => {
  const ssPrefix = 'search-current-tree-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it(`Search current tree by word is successfully loaded`, () => {
    const searchText = 'help';

    cy.visit('/');

    cy.waitUntil(() => {
      // do
      cy.getByTestid('select-search-scope').should('be.visible').click();
      // wait until
      return cy.get('.grw-global-search-container').within(() => {
        return Cypress.$('.dropdown-menu.show').is(':visible');
      });
    });

    cy.get('.grw-global-search-container').within(() => {
      cy.get('.dropdown-menu.show').should('be.visible');
      cy.get('.show > div > button:nth-child(2)').click();
      cy.get('.rbt-input').should('be.focused');
      cy.screenshot(`${ssPrefix}1-search-input-focused`);
    });

    cy.get('.rbt-input').type(`${searchText}`);
    cy.screenshot(`${ssPrefix}2-insert-search-text`, { capture: 'viewport'});
    cy.get('.rbt-input').type('{enter}');

    cy.getByTestid('search-result-base').should('be.visible');
    cy.getByTestid('search-result-list').should('be.visible');
    cy.getByTestid('search-result-content').should('be.visible');
    cy.get('.wiki').should('be.visible');
    cy.waitUntilSpinnerDisappear();

    // force to add 'active' to pass VRT: https://github.com/weseek/growi/pull/6603
    cy.getByTestid('page-list-item-L').first().invoke('addClass', 'active');
    // for avoid mismatch by auto scrolling
    cy.get('.search-result-content-body-container').scrollTo('top');
    cy.screenshot(`${ssPrefix}3-search-page-results`, { capture: 'viewport'});
  });

});
