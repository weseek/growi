const adminMenues = [
  'app', // App
  'security', // Security
  'security', // Security
  'security', // Security
  'security', // Security
  'security', // Security
  'security', // Security
  'security', // Security
  'security', // Security
  'security', // Security
  'security', // Security
];

context('Access to Admin page', () => {
  const ssPrefix = 'access-to-admin-page-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
  });

  it('/admin is successfully loaded', () => {
    cy.visit('/admin');
    cy.getByTestid('admin-home').should('be.visible');
    cy.getByTestid('admin-system-information-table').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin`);
  });

  it('/admin/app is successfully loaded', () => {
    cy.visit('/admin/app');
    cy.getByTestid('admin-app-settings').should('be.visible');
    cy.getByTestid('v5-page-migration').should('be.visible');
    cy.get('#cbFileUpload').should('be.checked');
    cy.get('#isQuestionnaireEnabled').should('be.checked');
    cy.get('#isAppSiteUrlHashed').should('not.be.checked');
    cy.screenshot(`${ssPrefix}-admin-app`);
  });

  it('/admin/security is successfully loaded', () => {
    cy.visit('/admin/security');
    cy.getByTestid('admin-security').should('be.visible');
    cy.get('#isShowRestrictedByOwner').should('be.checked')
    cy.get('#isShowRestrictedByGroup').should('be.checked')
    cy.screenshot(`${ssPrefix}-admin-security`);
  });

  it('/admin/markdown is successfully loaded', () => {
    cy.visit('/admin/markdown');
    cy.getByTestid('admin-markdown').should('be.visible');
    cy.get('#isEnabledLinebreaksInComments').should('be.checked')
    cy.screenshot(`${ssPrefix}-admin-markdown`);
  });

  it('/admin/customize is successfully loaded', () => {
    cy.visit('/admin/customize');
    cy.getByTestid('admin-customize').should('be.visible');
    /* eslint-disable cypress/no-unnecessary-waiting */
    cy.wait(500); // wait for loading layout image
    cy.screenshot(`${ssPrefix}-admin-customize`);
  });

  it('/admin/importer is successfully loaded', () => {
    cy.visit('/admin/importer');
    cy.getByTestid('admin-import-data').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-importer`);
  });

  it('/admin/export is successfully loaded', () => {
    cy.visit('/admin/export');
    cy.getByTestid('admin-export-archive-data').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-export`);
  });

  it('/admin/notification is successfully loaded', () => {
    cy.visit('/admin/notification');
    cy.getByTestid('admin-notification').should('be.visible');
    // wait for retrieving slack integration status
    cy.getByTestid('slack-integration-list-item').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-notification`);
  });

  it('/admin/slack-integration is successfully loaded', () => {
    cy.visit('/admin/slack-integration');
    cy.getByTestid('admin-slack-integration').should('be.visible');

    cy.get('img.bot-difficulty-icon')
      .should('have.length', 3)
      .should('be.visible');

    cy.screenshot(`${ssPrefix}-admin-slack-integration`);
  });

  it('/admin/slack-integration-legacy is successfully loaded', () => {
    cy.visit('/admin/slack-integration-legacy');
    cy.getByTestid('admin-slack-integration-legacy').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-slack-integration-legacy`);
  });

  it('/admin/users is successfully loaded', () => {
    cy.visit('/admin/users');
    cy.getByTestid('admin-users').should('be.visible');
    cy.getByTestid('user-table-tr').first().should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-users`);
  });

  it('/admin/user-groups is successfully loaded', () => {
    cy.visit('/admin/user-groups');
    cy.getByTestid('admin-user-groups').should('be.visible');
    cy.getByTestid('grw-user-group-table').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-user-groups`);
  });

  it('/admin/search is successfully loaded', () => {
    cy.visit('/admin/search');
    cy.getByTestid('admin-full-text-search').should('be.visible');
    // wait for connected
    cy.getByTestid('connection-status-badge-connected').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-search`);
  });

});
