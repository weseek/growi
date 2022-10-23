import React from 'react';

import { isClient, objectIdUtils } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Container, Provider } from 'unstated';

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
import AdminTwitterSecurityContainer from '~/client/services/AdminTwitterSecurityContainer';
import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { SupportedActionType } from '~/interfaces/activity';
import { CrowiRequest } from '~/interfaces/crowi-request';
import PluginUtils from '~/server/plugins/plugin-utils';
import ConfigLoader from '~/server/service/config-loader';
import {
  useCurrentUser, /* useSearchServiceConfigured, */ useIsAclEnabled, useIsMailerSetup, useIsSearchServiceReachable, useSiteUrl,
  useAuditLogEnabled, useAuditLogAvailableActions, useIsSearchPage, useCustomizeTitle,
} from '~/stores/context';
import { useIsMaintenanceMode } from '~/stores/maintenanceMode';

import {
  CommonProps, getServerSideCommonProps, getNextI18NextConfig, useCustomTitle,
} from '../utils/commons';


// import { useEnvVars } from '~/stores/admin-context';

const AdminHome = dynamic(() => import('../../components/Admin/AdminHome/AdminHome'), { ssr: false });
const AppSettingsPageContents = dynamic(() => import('../../components/Admin/App/AppSettingsPageContents'), { ssr: false });
const SecurityManagement = dynamic(() => import('../../components/Admin/Security/SecurityManagement'), { ssr: false });
const MarkDownSettingContents = dynamic(() => import('../../components/Admin/MarkdownSetting/MarkDownSettingContents'), { ssr: false });
const CustomizeSettingContents = dynamic(() => import('../../components/Admin/Customize/Customize'), { ssr: false });
const DataImportPageContents = dynamic(() => import('../../components/Admin/ImportData/ImportDataPageContents'), { ssr: false });
const ExportArchiveDataPage = dynamic(() => import('../../components/Admin/ExportArchiveDataPage'), { ssr: false });
const NotificationSetting = dynamic(() => import('../../components/Admin/Notification/NotificationSetting'), { ssr: false });
const ManageGlobalNotification = dynamic(() => import('../../components/Admin/Notification/ManageGlobalNotification'), { ssr: false });
const SlackIntegration = dynamic(() => import('../../components/Admin/SlackIntegration/SlackIntegration'), { ssr: false });
const LegacySlackIntegration = dynamic(() => import('../../components/Admin/LegacySlackIntegration/LegacySlackIntegration'), { ssr: false });
const UserManagement = dynamic(() => import('../../components/Admin/UserManagement'), { ssr: false });
const ManageExternalAccount = dynamic(() => import('../../components/Admin/ManageExternalAccount'), { ssr: false });
const ElasticsearchManagement = dynamic(() => import('../../components/Admin/ElasticsearchManagement/ElasticsearchManagement'), { ssr: false });
const UserGroupDetailPage = dynamic(() => import('../../components/Admin/UserGroupDetail/UserGroupDetailPage'), { ssr: false });
const AdminLayout = dynamic(() => import('../../components/Layout/AdminLayout'), { ssr: false });
// named export
const UserGroupPage = dynamic(() => import('../../components/Admin/UserGroup/UserGroupPage').then(mod => mod.UserGroupPage), { ssr: false });
const AuditLogManagement = dynamic(() => import('../../components/Admin/AuditLogManagement').then(mod => mod.AuditLogManagement), { ssr: false });

const pluginUtils = new PluginUtils();

type Props = CommonProps & {
  currentUser: any,

  nodeVersion: string,
  npmVersion: string,
  yarnVersion: string,
  installedPlugins: any,
  envVars: any,
  isAclEnabled: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isMailerSetup: boolean,
  auditLogEnabled: boolean,
  auditLogAvailableActions: SupportedActionType[],

  customizeTitle: string,
  siteUrl: string,
};

const AdminPage: NextPage<Props> = (props: Props) => {

  const { t } = useTranslation('admin');
  const router = useRouter();
  const { path } = router.query;
  const pagePathKeys: string[] = Array.isArray(path) ? path : ['home'];

  /*
  * Set userGroupId as a adminPagesMap key
  * eg) In case that url is `/user-group-detail/62e8388a9a649bea5e703ef7`, userGroupId will be 62e8388a9a649bea5e703ef7
  */
  let userGroupId;
  const [firstPath, secondPath] = pagePathKeys;
  if (firstPath === 'user-group-detail') {
    userGroupId = objectIdUtils.isValidObjectId(secondPath) ? secondPath : undefined;
  }

  // TODO: refactoring adminPagesMap => https://redmine.weseek.co.jp/issues/102694
  const adminPagesMap = {
    home: {
      title:  t('wiki_management_home_page'),
      component: <AdminHome
        nodeVersion={props.nodeVersion}
        npmVersion={props.npmVersion}
        yarnVersion={props.yarnVersion}
        installedPlugins={props.installedPlugins}
      />,
    },
    app: {
      title: t('commons:headers.app_settings'),
      component: <AppSettingsPageContents />,
    },
    security: {
      title: t('security_settings.security_settings'),
      component: <SecurityManagement />,
    },
    markdown: {
      title: t('markdown_settings.markdown_settings'),
      component: <MarkDownSettingContents />,
    },
    customize: {
      title: t('customize_settings.customize_settings'),
      component: <CustomizeSettingContents />,
    },
    importer: {
      title: t('importer_management.import_data'),
      component: <DataImportPageContents />,
    },
    export: {
      title: t('export_archive_data'),
      component: <ExportArchiveDataPage />,
    },
    notification: {
      title: t('external_notification.external_notification'),
      component: <NotificationSetting />,
    },
    'global-notification': {
      new: {
        title: t('external_notification.external_notification'),
        component: <ManageGlobalNotification />,
      },
    },
    'slack-integration': {
      title: t('slack_integration.slack_integration'),
      component: <SlackIntegration />,
    },
    'slack-integration-legacy': {
      title: t('slack_integration_legacy.slack_integration_legacy'),
      component: <LegacySlackIntegration />,
    },
    users: {
      title: t('user_management.user_management'),
      component: <UserManagement />,
      'external-accounts': {
        title: t('user_management.external_account'),
        component: <ManageExternalAccount />,
      },
    },
    'user-groups': {
      title:  t('user_group_management.user_group_management'),
      component: <UserGroupPage />,
    },
    'user-group-detail': {
      [userGroupId]: {
        title: t('user_group_management.user_group_management'),
        component: <UserGroupDetailPage userGroupId={userGroupId} />,
      },
    },
    search: {
      title: t('full_text_search_management.full_text_search_management'),
      component: <ElasticsearchManagement />,
    },
    'audit-log': {
      title: t('audit_log_management.audit_log'),
      component: <AuditLogManagement />,
    },
  };

  const getTargetPageToRender = (pagesMap, keys): {title: string, component: JSX.Element} => {
    return keys.reduce((pagesMap, key) => {
      return pagesMap[key];
    }, pagesMap);
  };

  const targetPage = getTargetPageToRender(adminPagesMap, pagePathKeys);

  useIsSearchPage(false);
  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);
  useIsMailerSetup(props.isMailerSetup);
  useIsMaintenanceMode(props.isMaintenanceMode);

  // useSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);

  useIsAclEnabled(props.isAclEnabled);
  useSiteUrl(props.siteUrl);

  // useEnvVars(props.envVars);

  useAuditLogEnabled(props.auditLogEnabled);
  useAuditLogAvailableActions(props.auditLogAvailableActions);

  useCustomizeTitle(props.customizeTitle);

  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    // Create unstated container instances (except Security)
    const adminAppContainer = new AdminAppContainer();
    const adminImportContainer = new AdminImportContainer();
    const adminHomeContainer = new AdminHomeContainer();
    const adminCustomizeContainer = new AdminCustomizeContainer();
    const adminUsersContainer = new AdminUsersContainer();
    const adminExternalAccountsContainer = new AdminExternalAccountsContainer();
    const adminNotificationContainer = new AdminNotificationContainer();
    const adminSlackIntegrationLegacyContainer = new AdminSlackIntegrationLegacyContainer();
    const adminMarkDownContainer = new AdminMarkDownContainer();

    injectableContainers.push(
      adminAppContainer,
      adminImportContainer,
      adminHomeContainer,
      adminCustomizeContainer,
      adminUsersContainer,
      adminExternalAccountsContainer,
      adminNotificationContainer,
      adminSlackIntegrationLegacyContainer,
      adminMarkDownContainer,
    );
  }


  const adminSecurityContainers: Container<any>[] = [];

  if (isClient()) {
    const adminSecuritySettingElem = document.getElementById('admin-security-setting');

    if (adminSecuritySettingElem != null) {
      // Create unstated container instances (Security)
      const adminGeneralSecurityContainer = new AdminGeneralSecurityContainer();
      const adminLocalSecurityContainer = new AdminLocalSecurityContainer();
      const adminLdapSecurityContainer = new AdminLdapSecurityContainer();
      const adminSamlSecurityContainer = new AdminSamlSecurityContainer();
      const adminOidcSecurityContainer = new AdminOidcSecurityContainer();
      const adminBasicSecurityContainer = new AdminBasicSecurityContainer();
      const adminGoogleSecurityContainer = new AdminGoogleSecurityContainer();
      const adminGitHubSecurityContainer = new AdminGitHubSecurityContainer();
      const adminTwitterSecurityContainer = new AdminTwitterSecurityContainer();

      adminSecurityContainers.push(
        adminGeneralSecurityContainer,
        adminLocalSecurityContainer,
        adminLdapSecurityContainer,
        adminSamlSecurityContainer,
        adminOidcSecurityContainer,
        adminBasicSecurityContainer,
        adminGoogleSecurityContainer,
        adminGitHubSecurityContainer,
        adminTwitterSecurityContainer,
      );
    }
  }


  return (
    <Provider inject={[...injectableContainers, ...adminSecurityContainers]}>
      <AdminLayout title={useCustomTitle(props, targetPage.title)} selectedNavOpt={firstPath} componentTitle={targetPage.title}>
        {targetPage.component}
      </AdminLayout>
    </Provider>
  );
};


async function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, mailService, aclService, searchService, activityService,
  } = crowi;

  props.siteUrl = appService.getSiteUrl();
  props.nodeVersion = crowi.runtimeVersions.versions.node ? crowi.runtimeVersions.versions.node.version.version : null;
  props.npmVersion = crowi.runtimeVersions.versions.npm ? crowi.runtimeVersions.versions.npm.version.version : null;
  props.yarnVersion = crowi.runtimeVersions.versions.yarn ? crowi.runtimeVersions.versions.yarn.version.version : null;
  props.installedPlugins = pluginUtils.listPlugins();
  props.envVars = await ConfigLoader.getEnvVarsForDisplay(true);
  props.isAclEnabled = aclService.isAclEnabled();

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;

  props.isMailerSetup = mailService.isMailerSetup;

  props.auditLogEnabled = crowi.configManager.getConfig('crowi', 'app:auditLogEnabled');
  props.auditLogAvailableActions = activityService.getAvailableActions(false);
  props.customizeTitle = crowi.configManager.getConfig('crowi', 'customize:title');
}

/**
 * for Server Side Translations
 * @param context
 * @param props
 * @param namespacesRequired
 */
async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  // preload all languages because of language lists in user setting
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired, true);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;

  const { user } = req;
  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }
  const props: Props = result.props as Props;
  if (user != null) {
    // props.currentUser = JSON.stringify(user.toObject());
    props.currentUser = JSON.stringify(user);
  }

  injectServerConfigurations(context, props);
  await injectNextI18NextConfigurations(context, props, ['admin', 'commons']);

  return {
    props,
  };
};

export default AdminPage;
