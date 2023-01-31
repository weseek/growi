context('Access to page', () => {
  const ssPrefix = 'access-to-page-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('/Sandbox is successfully loaded', () => {
    cy.visit('/Sandbox');
    cy.waitUntilSkeletonDisappear();

    // for check download toc data
    // https://redmine.weseek.co.jp/issues/111384
    // cy.get('.toc-link').should('be.visible');

    cy.collapseSidebar(true, true);
    cy.screenshot(`${ssPrefix}-sandbox`);
  });

  // TODO: https://redmine.weseek.co.jp/issues/109939
  it('/Sandbox with anchor hash is successfully loaded', () => {
    cy.visit('/Sandbox#Headers');
    cy.waitUntilSkeletonDisappear();

    // for check download toc data
    // https://redmine.weseek.co.jp/issues/111384
    // cy.get('.toc-link').should('be.visible');

    // hide fab
    cy.getByTestid('grw-fab-container').invoke('attr', 'style', 'display: none');

    // remove animation for screenshot
    // remove 'blink' class because ::after element cannot be operated
    // https://stackoverflow.com/questions/5041494/selecting-and-manipulating-css-pseudo-elements-such-as-before-and-after-usin/21709814#21709814
    cy.get('#mdcont-headers').invoke('removeClass', 'blink');

    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-sandbox-headers`);
  });

  it('/Sandbox/Math is successfully loaded', () => {
    cy.visit('/Sandbox/Math');
    cy.waitUntilSkeletonDisappear();

    // for check download toc data
    // https://redmine.weseek.co.jp/issues/111384
    // cy.get('.toc-link').should('be.visible');

    cy.get('.math').should('be.visible');

    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-sandbox-math`);
  });

  it('/Sandbox with edit is successfully loaded', () => {
    cy.visit('/Sandbox#edit');
    cy.waitUntilSkeletonDisappear();

    cy.getByTestid('navbar-editor').should('be.visible');
    cy.get('.grw-editor-navbar-bottom').should('be.visible');
    cy.getByTestid('save-page-btn').should('be.visible');
    cy.get('.grw-grant-selector').should('be.visible');

    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-Sandbox-edit-page`);
  })

  it('View and Edit contents are successfully loaded', () => {
    const body1 = 'hello';
    const body2 = ' world!';
    const savePageShortcutKey = '{ctrl+s}';

    cy.visit('/Sandbox/testForUseEditingMarkdown');

    cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.get('@pageEditorModeManager').within(() => {
        cy.get('button:nth-child(2)').click();
      });
      // until
      return cy.get('.layout-root').then($elem => $elem.hasClass('editing'));
    })

    cy.get('.CodeMirror').should('be.visible');

    // check VIEW contents after save
    cy.get('.CodeMirror').type(body1);
    cy.get('.CodeMirror').contains(body1);
    cy.get('.page-editor-preview-body').contains(body1);
    cy.getByTestid('page-editor').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.getByTestid('save-page-btn').should('be.visible').click();
      // wait until
      return Cypress.$('.layout-root').hasClass('editing');
    });
    cy.screenshot('useEditingMarkdown1');
    cy.get('.wiki').children().first().should('have.text', body1);

    cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.get('@pageEditorModeManager').within(() => {
        cy.get('button:nth-child(2)').click();
      });
      // until
      return cy.get('.layout-root').then($elem => $elem.hasClass('editing'));
    })

    cy.screenshot('useEditingMarkdown2');
    // cy.get('.CodeMirror').should('be.visible');

    // check EDIT contents after save with shortcut key
    cy.get('.CodeMirror').type(body2);
    cy.screenshot('useEditingMarkdown3');
    cy.get('.CodeMirror').contains(body1+body2);
    cy.get('.page-editor-preview-body').contains(body1+body2);
    cy.get('.CodeMirror').type(savePageShortcutKey);
    cy.get('.CodeMirror').contains(body1+body2);
    cy.get('.page-editor-preview-body').contains(body1+body2);
    cy.getByTestid('page-editor').should('be.visible');
    cy.waitUntil(() => {
      // do
      cy.getByTestid('save-page-btn').should('be.visible').click();
      // wait until
      return Cypress.$('.layout-root').hasClass('editing');
    });
    cy.screenshot('useEditingMarkdown4');
    // cy.getByTestid('save-page-btn').click();
    // cy.get('.layout-root').should('not.have.class', 'editing');
    // cy.waitUntil(() => {
    //   return cy.get('.layout-root').then($elem => !$elem.hasClass('editing'));
    // })
    cy.get('.wiki').children().first().should('have.text', body1+body2);
    // const testContents = 'test contents';
    // const testContents2 = 'test contents2';
    // const savePageShortcutKey = '{ctrl+s}';

    // cy.visit('/Sandbox/test');

    // cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
    // cy.waitUntil(() => {
    //   // do
    //   cy.get('@pageEditorModeManager').within(() => {
    //     cy.get('button:nth-child(2)').click();
    //   });
    //   // until
    //   return cy.get('.layout-root').then($elem => $elem.hasClass('editing'));
    // })

    // cy.get('.grw-editor-navbar-bottom').should('be.visible');
    // cy.get('.CodeMirror').type(testContents);

    // // check VIEW contents after saving
    // cy.getByTestid('save-page-btn').click();
    // cy.get('.wiki').should('be.visible');
    // cy.get('.wiki').children().first().should('have.text', testContents);

    // // check EDIT contents after saving
    // cy.get('#grw-page-editor-mode-manager').as('pageEditorModeManager').should('be.visible');
    // cy.waitUntil(() => {
    //   // do
    //   cy.get('@pageEditorModeManager').within(() => {
    //     cy.get('button:nth-child(2)').click();
    //   });
    //   // until
    //   return cy.get('.layout-root').then($elem => $elem.hasClass('editing'));
    // })
    // cy.get('.grw-editor-navbar-bottom').should('be.visible');
    // cy.get('.CodeMirror').contains(testContents);

    // // check EDIT contents after saving with shortcut key
    // cy.get('.CodeMirror').type(testContents2);
    // cy.get('.CodeMirror').type(savePageShortcutKey);
    // cy.get('.CodeMirror').contains(testContents+testContents2);
  })

  it('/user/admin is successfully loaded', () => {
    cy.visit('/user/admin');

    cy.waitUntilSkeletonDisappear();
    // for check download toc data
    // https://redmine.weseek.co.jp/issues/111384
    // cy.get('.toc-link').should('be.visible');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000); // wait for calcViewHeight and rendering
    cy.collapseSidebar(true);
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
  });

  it('/me is successfully loaded', () => {
    cy.visit('/me');

    cy.getByTestid('grw-user-settings').should('be.visible');

    cy.collapseSidebar(true);
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
  });

  it('/trash is successfully loaded', () => {
    cy.visit('/trash');

    cy.getByTestid('trash-page-list').contains('There are no pages under this page.');

    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-trash`);
  });

  it('/tags is successfully loaded', { scrollBehavior: false } ,() => {
    // open sidebar
    // cy.collapseSidebar(false);

    cy.visit('/tags');

    // cy.getByTestid('grw-sidebar-content-tags').within(() => {
    //   cy.getByTestid('grw-tags-list').should('be.visible');
    //   cy.getByTestid('grw-tags-list').contains('You have no tag, You can set tags on pages');
    // })

    cy.getByTestid('tags-page').within(() => {
      cy.getByTestid('grw-tags-list').should('be.visible');
      cy.getByTestid('grw-tags-list').contains('You have no tag, You can set tags on pages');
    });

    cy.collapseSidebar(true);
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
  });

  // TODO: 109057
  // it('Access to Template Editor mode for only child pages successfully', () => {
  //   cy.visit('/Sandbox/Bootstrap4', {  });
  //   cy.waitUntilSkeletonDisappear();

  //   cy.get('#grw-subnav-container').within(() => {
  //     cy.getByTestid('open-page-item-control-btn').should('be.visible');
  //     cy.getByTestid('open-page-item-control-btn').click();
  //     cy.getByTestid('open-page-template-modal-btn').should('be.visible');
  //     cy.getByTestid('open-page-template-modal-btn').click();
  //   });

  //   cy.getByTestid('page-template-modal').should('be.visible');
  //   cy.screenshot(`${ssPrefix}-open-page-template-bootstrap4`);

  // Todo: `@`alias may be changed. This code was made in an attempt to solve the error of element being dettached from the dom which couldn't be solved at this time.
  // Wait for Todo: 109057 is solved and fix or leave the code below for better test code.
  //   cy.getByTestid('template-button-children').as('template-button-children');
  //   cy.get('@template-button-children').should('be.visible').click();
  //   cy.waitUntilSkeletonDisappear();

  //   cy.getByTestid('navbar-editor').should('be.visible').then(()=>{
  //     cy.url().should('include', '/_template#edit');
  //     cy.screenshot();
  //   });
  // });

  // TODO: 109057
  // it('Access to Template Editor mode including decendants successfully', () => {
  //   cy.visit('/Sandbox/Bootstrap4', {  });
  //   cy.waitUntilSkeletonDisappear();

  //   cy.get('#grw-subnav-container').within(() => {
  //     cy.getByTestid('open-page-item-control-btn').should('be.visible');
  //     cy.getByTestid('open-page-item-control-btn').click();
  //     cy.getByTestid('open-page-template-modal-btn').should('be.visible');
  //     cy.getByTestid('open-page-template-modal-btn').click();
  //   });
  //   cy.getByTestid('page-template-modal').should('be.visible');

  // Todo: `@`alias may be changed. This code was made in an attempt to solve the error of element being dettached from the dom which couldn't be solved at this time.
  // Wait for Todo: 109057 is solved and fix or leave the code below for better test code.
  //   cy.getByTestid('template-button-decendants').as('template-button-decendants');
  //   cy.get('@template-button-decendants').should('be.visible').click();
  //   cy.waitUntilSkeletonDisappear();

  //   cy.getByTestid('navbar-editor').should('be.visible').then(()=>{
  //     cy.url().should('include', '/__template#edit');
  //     cy.screenshot();
  //   });
  // });

});

context('Access to /me/all-in-app-notifications', () => {
  const ssPrefix = 'in-app-notifications-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('All In-App Notification list is successfully loaded', { scrollBehavior: false },() => {
    cy.visit('/');
    cy.get('.notification-wrapper').click();
    cy.get('.notification-wrapper > .dropdown-menu > a').click();

    cy.getByTestid('grw-in-app-notification-page').should('be.visible');
    cy.getByTestid('grw-in-app-notification-page-spinner').should('not.exist');

    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-see-all`);

    cy.get('.grw-custom-nav-tab > div > ul > li:nth-child(2) > a').click();
    cy.getByTestid('grw-in-app-notification-page-spinner').should('not.exist');

    cy.collapseSidebar(true);
    cy.screenshot(`${ssPrefix}-see-unread`);
   });

})
