import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';

import loggerFactory from '~/utils/logger';

import ErrorBoundary from './components/ErrorBoudary';

import AdminHome from './components/Admin/AdminHome/AdminHome';
import UserGroupDetailPage from './components/Admin/UserGroupDetail/UserGroupDetailPage';
import NotificationSetting from './components/Admin/Notification/NotificationSetting';
import ManageGlobalNotification from './components/Admin/Notification/ManageGlobalNotification';
import MarkdownSetting from './components/Admin/MarkdownSetting/MarkDownSetting';
import UserManagement from './components/Admin/UserManagement';
import AppSettingsPage from './components/Admin/App/AppSettingsPage';
import SecurityManagement from './components/Admin/Security/SecurityManagement';
import ManageExternalAccount from './components/Admin/ManageExternalAccount';
import UserGroupPage from './components/Admin/UserGroup/UserGroupPage';
import ImportDataPage from './components/Admin/ImportDataPage';
import { ExportArchiveDataPage } from '~/components/Admin/DataExport/ExportArchiveDataPage';
import FullTextSearchManagement from './components/Admin/FullTextSearchManagement';
import AdminNavigation from '~/components/Admin/Common/AdminNavigation';

import NavigationContainer from './services/NavigationContainer';

import AdminSocketIoContainer from './services/AdminSocketIoContainer';
import AdminHomeContainer from './services/AdminHomeContainer';
import AdminCustomizeContainer from './services/AdminCustomizeContainer';
import AdminUserGroupDetailContainer from './services/AdminUserGroupDetailContainer';
import AdminUsersContainer from './services/AdminUsersContainer';
import AdminAppContainer from './services/AdminAppContainer';
import AdminImportContainer from './services/AdminImportContainer';
import AdminMarkDownContainer from './services/AdminMarkDownContainer';
import AdminExternalAccountsContainer from './services/AdminExternalAccountsContainer';
import AdminGeneralSecurityContainer from './services/AdminGeneralSecurityContainer';
import AdminLdapSecurityContainer from './services/AdminLdapSecurityContainer';
import AdminLocalSecurityContainer from './services/AdminLocalSecurityContainer';
import AdminSamlSecurityContainer from './services/AdminSamlSecurityContainer';
import AdminOidcSecurityContainer from './services/AdminOidcSecurityContainer';
import AdminBasicSecurityContainer from './services/AdminBasicSecurityContainer';
import AdminGoogleSecurityContainer from './services/AdminGoogleSecurityContainer';
import AdminGitHubSecurityContainer from './services/AdminGitHubSecurityContainer';
import AdminTwitterSecurityContainer from './services/AdminTwitterSecurityContainer';
import AdminNotificationContainer from './services/AdminNotificationContainer';

import { appContainer, componentMappings } from './base';

const logger = loggerFactory('growi:admin');

appContainer.initContents();

// create unstated container instance
const navigationContainer = new NavigationContainer(appContainer);
const adminAppContainer = new AdminAppContainer(appContainer);
const adminImportContainer = new AdminImportContainer(appContainer);
const adminSocketIoContainer = new AdminSocketIoContainer(appContainer);
const adminHomeContainer = new AdminHomeContainer(appContainer);
const adminCustomizeContainer = new AdminCustomizeContainer(appContainer);
const adminUsersContainer = new AdminUsersContainer(appContainer);
const adminExternalAccountsContainer = new AdminExternalAccountsContainer(appContainer);
const adminNotificationContainer = new AdminNotificationContainer(appContainer);
const adminMarkDownContainer = new AdminMarkDownContainer(appContainer);
const adminUserGroupDetailContainer = new AdminUserGroupDetailContainer(appContainer);
const injectableContainers = [
  appContainer,
  navigationContainer,
  adminAppContainer,
  adminImportContainer,
  adminSocketIoContainer,
  adminHomeContainer,
  adminCustomizeContainer,
  adminUsersContainer,
  adminExternalAccountsContainer,
  adminNotificationContainer,
  adminNotificationContainer,
  adminMarkDownContainer,
  adminUserGroupDetailContainer,
];

logger.info('unstated containers have been initialized');

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
Object.assign(componentMappings, {
  'admin-home': <AdminHome />,
  'admin-app': <AppSettingsPage />,
  'admin-markdown-setting': <MarkdownSetting />,
  'admin-importer': <ImportDataPage />,
  'admin-export-page': <ExportArchiveDataPage />,
  'admin-notification-setting': <NotificationSetting />,
  'admin-global-notification-setting': <ManageGlobalNotification />,
  'admin-user-page': <UserManagement />,
  'admin-external-account-setting': <ManageExternalAccount />,
  'admin-user-group-detail': <UserGroupDetailPage />,
  'admin-full-text-search-management': <FullTextSearchManagement />,
  'admin-user-group-page': <UserGroupPage />,
  'admin-navigation': <AdminNavigation />,
});


Object.keys(componentMappings).forEach((key) => {
  const elem = document.getElementById(key);
  if (elem) {
    ReactDOM.render(
      <ErrorBoundary>
        <Provider inject={injectableContainers}>
          {componentMappings[key]}
        </Provider>
      </ErrorBoundary>,
      elem,
    );
  }
});

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
    <ErrorBoundary>
      <Provider inject={[...injectableContainers, ...adminSecurityContainers]}>
        <SecurityManagement />
      </Provider>
    </ErrorBoundary>,
    adminSecuritySettingElem,
  );
}
