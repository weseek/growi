context('Access Home', () => {
  const ssPrefix = 'home-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('Visit home', () => {
    cy.visit('/dummy');
    cy.getByTestid('grw-personal-dropdown').click();
    cy.getByTestid('grw-personal-dropdown').find('.dropdown-menu .btn-group > .btn-outline-secondary:eq(0)').click();

    cy.get('.grw-users-info').should('be.visible');
    // for check download toc data
    cy.get('.toc-link').should('be.visible');

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
    // collapse sidebar
    cy.collapseSidebar(true);
    cy.visit('/me');
    // hide fab // disable fab for sticky-events warning
    // cy.getByTestid('grw-fab-container').invoke('attr', 'style', 'display: none');
  });

  it('Access User information', () => {
    // User information
    cy.getByTestid('grw-user-settings').should('be.visible');
    cy.screenshot(`${ssPrefix}-user-information-1`);
    cy.getByTestid('grw-besic-info-settings-update-button').click();
    cy.get('.toast').should('be.visible').invoke('attr', 'style', 'opacity: 1');
    cy.screenshot(`${ssPrefix}-user-information-2`);

    cy.get('.toast-close-button').click({ multiple: true }); // close toast alert
    cy.get('.toast').should('not.exist');
  });

  it('Access External account', () => {
    cy.getByTestid('grw-personal-settings').find('.nav-title.nav li:eq(1) a').click();
    cy.scrollTo('top');
    cy.screenshot(`${ssPrefix}-external-account-1`);
    cy.getByTestid('grw-external-account-add-button').click();
    cy.getByTestid('grw-associate-modal').should('be.visible');
    cy.screenshot(`${ssPrefix}-external-account-2`);
    cy.getByTestid('grw-associate-modal').find('.modal-footer button').click(); // click add button in modal form
    cy.get('.toast').should('be.visible').invoke('attr', 'style', 'opacity: 1');
    cy.screenshot(`${ssPrefix}-external-account-3`);
    cy.get('.toast-close-button').click({ multiple: true }); // close toast alert
    cy.get('.toast').should('not.exist');
    cy.getByTestid('grw-associate-modal').find('.close').click();
    cy.screenshot(`${ssPrefix}-external-account-4`);

    cy.get('.toast').should('not.exist');
  });

  it('Access Password setting', () => {
    cy.getByTestid('grw-personal-settings').find('.nav-title.nav li:eq(2) a').click();
    cy.scrollTo('top');
    cy.screenshot(`${ssPrefix}-password-settings-1`);
    cy.getByTestid('grw-password-settings-update-button').click();
    cy.get('.toast').should('be.visible').invoke('attr', 'style', 'opacity: 1');
    cy.screenshot(`${ssPrefix}-password-settings-2`);

    cy.get('.toast-close-button').click({ multiple: true }); // close toast alert
    cy.get('.toast').should('not.exist');
  });

  it('Access API setting', () => {
    cy.getByTestid('grw-personal-settings').find('.nav-title.nav li:eq(3) a').click();
    cy.scrollTo('top');
    cy.screenshot(`${ssPrefix}-api-setting-1`);
    cy.getByTestid('grw-api-settings-update-button').click();
    cy.getByTestid('grw-api-settings-input').should('be.visible');
    cy.get('.toast').should('be.visible').invoke('attr', 'style', 'opacity: 1');
    cy.screenshot(`${ssPrefix}-api-setting-2`);

    cy.get('.toast-close-button').click({ multiple: true }); // close toast alert
    cy.get('.toast').should('not.exist');
  });

  it('Access Editor setting', () => {
    cy.getByTestid('grw-personal-settings').find('.nav-title.nav li:eq(4) a').click();
    cy.scrollTo('top');
    cy.getByTestid('grw-editor-settings').should('be.visible');
    cy.screenshot(`${ssPrefix}-editor-setting-1`);
    cy.getByTestid('grw-editor-settings-update-button').click();
    cy.get('.toast').should('be.visible').invoke('attr', 'style', 'opacity: 1');
    cy.screenshot(`${ssPrefix}-editor-setting-2`);

    cy.get('.toast-close-button').click({ multiple: true }); // close toast alert
    cy.get('.toast').should('not.exist');
  });

  it('Access In-app notification setting', () => {
    cy.getByTestid('grw-personal-settings').find('.nav-title.nav li:eq(5) a').click();
    cy.scrollTo('top');
    cy.screenshot(`${ssPrefix}-in-app-notification-setting-1`);
    cy.getByTestid('grw-in-app-notification-settings-update-button').click();
    cy.get('.toast').should('be.visible').invoke('attr', 'style', 'opacity: 1');
    cy.screenshot(`${ssPrefix}-in-app-notification-setting-2`);
  });
});
