context('Access to page', () => {
  const ssPrefix = 'access-to-page-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('/Sandbox is successfully loaded', () => {
    cy.visit('/Sandbox', {  });
    cy.screenshot(`${ssPrefix}-sandbox`);
  });

  it('/Sandbox with anchor hash is successfully loaded', () => {
    cy.visit('/Sandbox#Headers');

    // hide fab // disable fab for sticky-events warning
    // cy.getByTestid('grw-fab-container').invoke('attr', 'style', 'display: none');

    // remove animation for screenshot
    // remove 'blink' class because ::after element cannot be operated
    // https://stackoverflow.com/questions/5041494/selecting-and-manipulating-css-pseudo-elements-such-as-before-and-after-usin/21709814#21709814
    cy.get('#mdcont-headers').invoke('removeClass', 'blink');

    cy.get('.grw-skelton').should('not.exist');
    cy.screenshot(`${ssPrefix}-sandbox-headers`);
  });

  it('/Sandbox/Math is successfully loaded', () => {
    cy.visit('/Sandbox/Math');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000); // wait for 2 seconds for MathJax.typesetPromise();

    cy.screenshot(`${ssPrefix}-sandbox-math`);
  });

  it('/Sandbox with edit is successfully loaded', () => {
    cy.visit('/Sandbox');
    cy.get('.grw-skelton', { timeout: 30000 }).should('not.exist');
    cy.get('#grw-subnav-container', { timeout: 30000 }).should('be.visible').within(()=>{
      cy.getByTestid('editor-button', { timeout: 30000 }).should('be.visible').click();
    })
    cy.getByTestid('navbar-editor', { timeout: 30000 }).should('be.visible');
    cy.screenshot(`${ssPrefix}-Sandbox-edit-page`);
  })

  it('/user/admin is successfully loaded', () => {
    cy.visit('/user/admin', {  });

    cy.get('.grw-skelton').should('not.exist');
    // for check download toc data
    cy.get('.toc-link').should('be.visible');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000); // wait for calcViewHeight and rendering

    cy.screenshot(`${ssPrefix}-user-admin`);
  });

});


context('Access to /me page', () => {
  const ssPrefix = 'access-to-me-page-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('/me is successfully loaded', () => {
    cy.visit('/me', {  });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500); // wait loading image
    cy.screenshot(`${ssPrefix}-me`);
  });

  // it('Draft page is successfully shown', () => {
  //   cy.visit('/me/drafts');
  //   cy.screenshot(`${ssPrefix}-draft-page`);
  // });

});



context('Access to special pages', () => {
  const ssPrefix = 'access-to-special-pages-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('/trash is successfully loaded', () => {
    cy.visit('/trash', {  });
    cy.getByTestid('trash-page-list').should('be.visible');
    cy.screenshot(`${ssPrefix}-trash`);
  });

  it('/tags is successfully loaded', () => {

    // open sidebar
    cy.collapseSidebar(false);

    cy.visit('/tags');
    // select tags
    cy.getByTestid('grw-sidebar-nav-primary-tags').click();
    cy.getByTestid('grw-sidebar-content-tags').should('be.visible');
    cy.getByTestid('grw-tags-list').should('be.visible');
    cy.getByTestid('grw-tags-list').contains('You have no tag, You can set tags on pages');

    cy.getByTestid('tags-page').should('be.visible');
    cy.screenshot(`${ssPrefix}-tags`);
  });

});

context('Access to Template Editing Mode', () => {
  const ssPrefix = 'access-to-modal-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });


  it('Access to Template Editor mode for only child pages successfully', () => {
    cy.visit('/Sandbox/Bootstrap4', {  });
    cy.get('#grw-subnav-container', { timeout: 30000 }).within(() => {
      cy.getByTestid('open-page-item-control-btn').click();
      cy.getByTestid('open-page-template-modal-btn').click();
    });

    cy.getByTestid('page-template-modal').should('be.visible')
    cy.screenshot(`${ssPrefix}-open-page-template-bootstrap4`);
    cy.getByTestid('template-button-children').click();
    cy.get('.grw-skelton', { timeout: 30000 }).should('not.exist').then(()=>{
      cy.getByTestid('navbar-editor', { timeout: 30000 }).should('be.visible').then(()=>{
        cy.url().should('include', '/_template#edit');
        cy.screenshot();
      })
    })
  });

  it('Access to Template Editor mode including decendants successfully', () => {
    cy.visit('/Sandbox/Bootstrap4', {  });
    cy.get('#grw-subnav-container').within(() => {
      cy.getByTestid('open-page-item-control-btn').click();
      cy.getByTestid('open-page-template-modal-btn').click();
    });

    cy.getByTestid('page-template-modal').should('be.visible')
    cy.getByTestid('template-button-decendants').click();
    cy.get('.grw-skelton', { timeout: 30000 }).should('not.exist').then(()=>{
      cy.getByTestid('navbar-editor', { timeout: 30000 }).should('be.visible').then(()=>{
        cy.url().should('include', '/__template#edit');
        cy.screenshot();
      })
    });
  });

});

context('Access to /me/all-in-app-notifications', () => {
  const ssPrefix = 'in-app-notifications-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('All In-App Notification list is successfully loaded', () => {
    cy.visit('/');
    cy.get('.notification-wrapper > a').click();
    cy.get('.notification-wrapper > .dropdown-menu > a').click();

    cy.screenshot(`${ssPrefix}-see-all`, { capture: 'viewport' });

    cy.get('.grw-custom-nav-tab > div > ul > li:nth-child(2) > a').click();

    cy.screenshot(`${ssPrefix}-see-unread`, { capture: 'viewport' });
   });

})

