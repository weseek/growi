context('Access Home', () => {
  const ssPrefix = 'home-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('Visit home', () => {
    cy.visit('/dummy');

    // open PersonalDropdown
    cy.waitUntil(() => {
      // do
      cy.getByTestid('personal-dropdown-button').should('be.visible').click();
      // wait until
      return cy.getByTestid('grw-personal-dropdown-menu-user-home').then($elem => $elem.is(':visible'));
    });
    // click the Home button
    cy.getByTestid('grw-personal-dropdown-menu-user-home').should('be.visible').click();

    cy.getByTestid('grw-users-info').should('be.visible');

    // for check download toc data
    // https://redmine.weseek.co.jp/issues/111384
    // cy.get('.toc-link').should('be.visible');

    // same screenshot is taken in access-to-page.spec
    cy.collapseSidebar(true);
    cy.waitUntilSkeletonDisappear();
    cy.screenshot(`${ssPrefix}-visit-home`);
  });

});


context('Access User settings', () => {
  const ssPrefix = 'access-user-settings-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    cy.visit('/me');
    cy.collapseSidebar(true, true);
    // hide fab
    cy.getByTestid('grw-fab-container').invoke('attr', 'style', 'display: none');
  });

  it('Access User information', () => {
    // User information
    cy.getByTestid('grw-user-settings').should('be.visible');
    cy.screenshot(`${ssPrefix}-user-information-1`);
    cy.getByTestid('grw-besic-info-settings-update-button').click();
    cy.get('.Toastify__toast').should('be.visible');
    cy.screenshot(`${ssPrefix}-user-information-2`);

    cy.get('.Toastify__toast').should('be.visible').within(() => {
      cy.get('.Toastify__close-button').should('be.visible').click();
      cy.get('.Toastify__progress-bar').invoke('attr', 'style', 'display: none')
    });
  });

  it('Access External account', () => {
    cy.getByTestid('grw-personal-settings').find('.nav-title.nav li:eq(1) a').click();
    cy.scrollTo('top');
    cy.screenshot(`${ssPrefix}-external-account-1`);
    cy.getByTestid('grw-external-account-add-button').click();
    cy.getByTestid('grw-associate-modal').should('be.visible');
    cy.screenshot(`${ssPrefix}-external-account-2`);
    cy.getByTestid('grw-associate-modal').find('.modal-footer button').click(); // click add button in modal form
    cy.get('.Toastify__toast').should('be.visible');
    cy.screenshot(`${ssPrefix}-external-account-3`);
    cy.get('.Toastify__toast').should('be.visible').within(() => {
      cy.get('.Toastify__close-button').should('be.visible').click();
      cy.get('.Toastify__progress-bar').invoke('attr', 'style', 'display: none')
    });
    cy.getByTestid('grw-associate-modal').find('.close').click();
    cy.screenshot(`${ssPrefix}-external-account-4`);

      cy.get('.Toastify__toast').should('not.be.visible');
    });

  it('Access Password setting', () => {
    cy.getByTestid('grw-personal-settings').find('.nav-title.nav li:eq(2) a').click();
    cy.scrollTo('top');
    cy.screenshot(`${ssPrefix}-password-settings-1`);
    cy.getByTestid('grw-password-settings-update-button').click();
    cy.get('.Toastify__toast').should('be.visible');
    cy.screenshot(`${ssPrefix}-password-settings-2`);

    cy.get('.Toastify__toast').each((toast) => {
      cy.wrap(toast).within(() => {
        cy.get('.Toastify__close-button').should('be.visible').click();
        cy.get('.Toastify__progress-bar').invoke('attr', 'style', 'display: none')
      });
    });
  });

  it('Access API setting', () => {
    cy.getByTestid('grw-personal-settings').find('.nav-title.nav li:eq(3) a').click();
    cy.scrollTo('top');
    cy.screenshot(`${ssPrefix}-api-setting-1`);
    cy.getByTestid('grw-api-settings-update-button').click();
    cy.getByTestid('grw-api-settings-input').should('be.visible');
    cy.get('.Toastify__toast').should('be.visible');
    cy.screenshot(`${ssPrefix}-api-setting-2`);

    cy.get('.Toastify__toast').should('be.visible').within(() => {
      cy.get('.Toastify__close-button').should('be.visible').click();
      cy.get('.Toastify__progress-bar').invoke('attr', 'style', 'display: none')
    });
  });

  it('Access In-app notification setting', () => {
    cy.getByTestid('grw-personal-settings').find('.nav-title.nav li:eq(4) a').click();
    cy.scrollTo('top');
    cy.screenshot(`${ssPrefix}-in-app-notification-setting-1`);
    cy.getByTestid('grw-in-app-notification-settings-update-button').click();
    cy.get('.Toastify__toast').should('be.visible');
    cy.screenshot(`${ssPrefix}-in-app-notification-setting-2`);
  });

  it('Access Other setting', () => {
    cy.getByTestid('grw-personal-settings').find('.nav-title.nav li:eq(5) a').click();
    cy.scrollTo('top');
    cy.screenshot(`${ssPrefix}-other-setting-1`);
    cy.getByTestid('grw-questionnaire-settings-update-btn').click();
    cy.get('.toast').should('be.visible').invoke('attr', 'style', 'opacity: 1');
    cy.screenshot(`${ssPrefix}-other-setting-2`);
  });
});

context('Access proactive questionnaire modal', () => {
  const ssPrefix = 'proactive-questionnaire-modal-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('Opens questionnaire modal', () => {
    cy.visit('/dummy');

    // open PersonalDropdown
    cy.waitUntil(() => {
      // do
      cy.getByTestid('personal-dropdown-button').should('be.visible').click();
      // wait until
      return cy.getByTestid('grw-personal-dropdown-menu-user-home').then($elem => $elem.is(':visible'));
    });

    cy.getByTestid('grw-proactive-questionnaire-modal-toggle-btn').should('be.visible').click();
    cy.getByTestid('grw-proactive-questionnaire-modal').should('be.visible');

    cy.screenshot(`${ssPrefix}-opened`);
  });
});
