import React from 'react';

import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { SWRConfig } from 'swr';
import { Provider } from 'unstated';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import AdminBasicSecurityContainer from '~/client/services/AdminBasicSecurityContainer';
import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import AdminExternalAccountsContainer from '~/client/services/AdminExternalAccountsContainer';
import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';
import AdminGitHubSecurityContainer from '~/client/services/AdminGitHubSecurityContainer';
import AdminGoogleSecurityContainer from '~/client/services/AdminGoogleSecurityContainer';
import AdminHomeContainer from '~/client/services/AdminHomeContainer';
import AdminImportContainer from '~/client/services/AdminImportContainer';
import AdminLdapSecurityContainer from '~/client/services/AdminLdapSecurityContainer';
import AdminLocalSecurityContainer from '~/client/services/AdminLocalSecurityContainer';
import AdminMarkDownContainer from '~/client/services/AdminMarkDownContainer';
import AdminNotificationContainer from '~/client/services/AdminNotificationContainer';
import AdminOidcSecurityContainer from '~/client/services/AdminOidcSecurityContainer';
import AdminSamlSecurityContainer from '~/client/services/AdminSamlSecurityContainer';
import AdminSlackIntegrationLegacyContainer from '~/client/services/AdminSlackIntegrationLegacyContainer';
import AdminSocketIoContainer from '~/client/services/AdminSocketIoContainer';
import AdminTwitterSecurityContainer from '~/client/services/AdminTwitterSecurityContainer';
// import AdminUserGroupDetailContainer from '~/client/services/AdminUserGroupDetailContainer';
import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import ContextExtractor from '~/client/services/ContextExtractor';
import loggerFactory from '~/utils/logger';
import { swrGlobalConfiguration } from '~/utils/swr-utils';

import AdminHome from '../components/Admin/AdminHome/AdminHome';
// import AppSettingsPage from '../components/Admin/App/AppSettingsPage';
import { AuditLogManagement } from '../components/Admin/AuditLogManagement';
import AdminNavigation from '../components/Admin/Common/AdminNavigation';
import Customize from '../components/Admin/Customize/Customize';
import ExportArchiveDataPage from '../components/Admin/ExportArchiveDataPage';
import FullTextSearchManagement from '../components/Admin/FullTextSearchManagement';
// import ImportDataPage from '../components/Admin/ImportDataPage';
import LegacySlackIntegration from '../components/Admin/LegacySlackIntegration/LegacySlackIntegration';
import ManageExternalAccount from '../components/Admin/ManageExternalAccount';
// import MarkdownSetting from '../components/Admin/MarkdownSetting/MarkDownSetting';
import ManageGlobalNotification from '../components/Admin/Notification/ManageGlobalNotification';
import NotificationSetting from '../components/Admin/Notification/NotificationSetting';
import SecurityManagement from '../components/Admin/Security/SecurityManagement';
import SlackIntegration from '../components/Admin/SlackIntegration/SlackIntegration';
import UserGroupPage from '../components/Admin/UserGroup/UserGroupPage';
import UserGroupDetailPage from '../components/Admin/UserGroupDetail/UserGroupDetailPage';
import UserManagement from '../components/Admin/UserManagement';
import ErrorBoundary from '../components/ErrorBoudary';

import { appContainer, componentMappings } from './base';

const logger = loggerFactory('growi:admin');

appContainer.initContents();

const { i18n } = appContainer;
// create unstated container instance
const adminAppContainer = new AdminAppContainer(appContainer);
const adminImportContainer = new AdminImportContainer(appContainer);
const adminSocketIoContainer = new AdminSocketIoContainer(appContainer);
const adminHomeContainer = new AdminHomeContainer(appContainer);
const adminCustomizeContainer = new AdminCustomizeContainer(appContainer);
const adminUsersContainer = new AdminUsersContainer(appContainer);
const adminExternalAccountsContainer = new AdminExternalAccountsContainer(appContainer);
const adminNotificationContainer = new AdminNotificationContainer(appContainer);
const adminSlackIntegrationLegacyContainer = new AdminSlackIntegrationLegacyContainer(appContainer);
const adminMarkDownContainer = new AdminMarkDownContainer(appContainer);
// const adminUserGroupDetailContainer = new AdminUserGroupDetailContainer(appContainer);
const socketIoContainer = appContainer.getContainer('SocketIoContainer');
const injectableContainers = [
  appContainer,
  adminAppContainer,
  adminImportContainer,
  adminSocketIoContainer,
  adminHomeContainer,
  adminCustomizeContainer,
  adminUsersContainer,
  adminExternalAccountsContainer,
  adminNotificationContainer,
  adminSlackIntegrationLegacyContainer,
  adminMarkDownContainer,
  // adminUserGroupDetailContainer,
  socketIoContainer,
];

logger.info('unstated containers have been initialized');

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
Object.assign(componentMappings, {
  'admin-home': <AdminHome />,
  // 'admin-app': <AppSettingsPage />,
  // 'admin-markdown-setting': <MarkdownSetting />,
  'admin-customize': <Customize />,
  // 'admin-importer': <ImportDataPage />,
  'admin-export-page': <ExportArchiveDataPage />,
  'admin-notification-setting': <NotificationSetting />,
  'admin-slack-integration': <SlackIntegration />,
  'admin-slack-integration-legacy': <LegacySlackIntegration />,
  'admin-global-notification-setting': <ManageGlobalNotification />,
  'admin-user-page': <UserManagement />,
  'admin-external-account-setting': <ManageExternalAccount />,
  'admin-user-group-detail': <UserGroupDetailPage />,
  'admin-full-text-search-management': <FullTextSearchManagement />,
  'admin-user-group-page': <UserGroupPage />,
  'admin-audit-log': <AuditLogManagement />,
  'admin-navigation': <AdminNavigation />,
});

const renderMainComponents = () => {
  Object.keys(componentMappings).forEach((key) => {
    const elem = document.getElementById(key);
    if (elem) {
      ReactDOM.render(
        <I18nextProvider i18n={i18n}>
          <ErrorBoundary>
            <Provider inject={injectableContainers}>
              {componentMappings[key]}
            </Provider>
          </ErrorBoundary>
        </I18nextProvider>,
        elem,
      );
    }
  });
};

// extract context before rendering main components
const elem = document.getElementById('growi-context-extractor');
if (elem != null) {
  ReactDOM.render(
    <SWRConfig value={swrGlobalConfiguration}>
      <ContextExtractor></ContextExtractor>
    </SWRConfig>,
    elem,
    renderMainComponents,
  );
}
else {
  renderMainComponents();
}

const adminSecuritySettingElem = document.getElementById('admin-security-setting');
if (adminSecuritySettingElem != null) {
  const adminGeneralSecurityContainer = new AdminGeneralSecurityContainer(appContainer);
  const adminLocalSecurityContainer = new AdminLocalSecurityContainer(appContainer);
  const adminLdapSecurityContainer = new AdminLdapSecurityContainer(appContainer);
  const adminSamlSecurityContainer = new AdminSamlSecurityContainer(appContainer);
  const adminOidcSecurityContainer = new AdminOidcSecurityContainer(appContainer);
  const adminBasicSecurityContainer = new AdminBasicSecurityContainer(appContainer);
  const adminGoogleSecurityContainer = new AdminGoogleSecurityContainer(appContainer);
  const adminGitHubSecurityContainer = new AdminGitHubSecurityContainer(appContainer);
  const adminTwitterSecurityContainer = new AdminTwitterSecurityContainer(appContainer);
  const adminSecurityContainers = [
    adminGeneralSecurityContainer, adminLocalSecurityContainer, adminLdapSecurityContainer, adminSamlSecurityContainer,
    adminOidcSecurityContainer, adminBasicSecurityContainer, adminGoogleSecurityContainer, adminGitHubSecurityContainer, adminTwitterSecurityContainer,
  ];
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <Provider inject={[...injectableContainers, ...adminSecurityContainers]}>
          <SecurityManagement />
        </Provider>
      </ErrorBoundary>
    </I18nextProvider>,
    adminSecuritySettingElem,
  );
}
