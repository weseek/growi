const ssPrefix = 'access-to-admin-page-';

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

  let connectSid: string | undefined;

  before(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);

    });
    cy.getCookie('connect.sid').then(cookie => {
      connectSid = cookie?.value;
    });
  });

  beforeEach(() => {
    if (connectSid != null) {
      cy.setCookie('connect.sid', connectSid);
    }
  });

  it('/admin is successfully loaded', () => {
    cy.visit('/admin');
    cy.getByTestid('admin-home').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin`, { capture: 'viewport' });
  });

  it('/admin/app is successfully loaded', () => {
    cy.visit('/admin/app');
    cy.getByTestid('admin-app-settings').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-app`, { capture: 'viewport' });
  });

  it('/admin/security is successfully loaded', () => {
    cy.visit('/admin/security');
    cy.getByTestid('admin-security').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-security`, { capture: 'viewport' });
  });

  it('/admin/markdown is successfully loaded', () => {
    cy.visit('/admin/markdown');
    cy.getByTestid('admin-markdown').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-markdown`, { capture: 'viewport' });
  });

  it('/admin/customize is successfully loaded', () => {
    cy.visit('/admin/customize');
    cy.getByTestid('admin-customize').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-customize`, { capture: 'viewport' });
  });

  it('/admin/importer is successfully loaded', () => {
    cy.visit('/admin/importer');
    cy.getByTestid('admin-import-data').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-importer`, { capture: 'viewport' });
  });

  it('/admin/export is successfully loaded', () => {
    cy.visit('/admin/export');
    cy.getByTestid('admin-export-archive-data').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-export`, { capture: 'viewport' });
  });

  it('/admin/notification is successfully loaded', () => {
    cy.visit('/admin/notification');
    cy.getByTestid('admin-notification').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-notification`, { capture: 'viewport' });
  });

  it('/admin/slack-integration is successfully loaded', () => {
    cy.visit('/admin/slack-integration');
    cy.getByTestid('admin-slack-integration').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-slack-integration`, { capture: 'viewport' });
  });

  it('/admin/slack-integration-legacy is successfully loaded', () => {
    cy.visit('/admin/slack-integration-legacy');
    cy.getByTestid('admin-slack-integration-legacy').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-slack-integration-legacy`, { capture: 'viewport' });
  });

  it('/admin/users is successfully loaded', () => {
    cy.visit('/admin/users');
    cy.getByTestid('admin-users').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-users`, { capture: 'viewport' });
  });

  it('/admin/user-groups is successfully loaded', () => {
    cy.visit('/admin/user-groups');
    cy.getByTestid('admin-user-groups').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-user-groups`, { capture: 'viewport' });
  });

  it('/admin/search is successfully loaded', () => {
    cy.visit('/admin/search');
    cy.getByTestid('admin-full-text-search').should('be.visible');
    cy.screenshot(`${ssPrefix}-admin-search`, { capture: 'viewport' });
  });

});
