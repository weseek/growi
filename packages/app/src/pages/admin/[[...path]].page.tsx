import React, { useCallback } from 'react';

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
import { CrowiRequest } from '~/interfaces/crowi-request';
import PluginUtils from '~/server/plugins/plugin-utils';
import ConfigLoader from '~/server/service/config-loader';
import {
  useCurrentUser, /* useSearchServiceConfigured, */ useIsAclEnabled, useIsMailerSetup, useIsSearchServiceReachable, useSiteUrl,
} from '~/stores/context';

import {
  CommonProps, getServerSideCommonProps, useCustomTitle, getNextI18NextConfig,
} from '../utils/commons';


// import { useEnvVars } from '~/stores/admin-context';

const AdminHome = dynamic(() => import('../../components/Admin/AdminHome/AdminHome'), { ssr: false });
const AppSettingsPageContents = dynamic(() => import('../../components/Admin/App/AppSettingsPageContents'), { ssr: false });
const SecurityManagementContents = dynamic(() => import('../../components/Admin/Security/SecurityManagementContents'), { ssr: false });
const MarkDownSettingContents = dynamic(() => import('../../components/Admin/MarkdownSetting/MarkDownSettingContents'), { ssr: false });
const CustomizeSettingContents = dynamic(() => import('../../components/Admin/Customize/Customize'), { ssr: false });
const DataImportPageContents = dynamic(() => import('../../components/Admin/ImportData/ImportDataPageContents'), { ssr: false });
const ExportArchiveDataPage = dynamic(() => import('../../components/Admin/ExportArchiveDataPage'), { ssr: false });
const NotificationSetting = dynamic(() => import('../../components/Admin/Notification/NotificationSetting'), { ssr: false });
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

  siteUrl: string,
};

const AdminMarkdownSettingsPage: NextPage<Props> = (props: Props) => {

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
      title: useCustomTitle(props, t('Wiki Management Home Page')),
      component: <AdminHome
        nodeVersion={props.nodeVersion}
        npmVersion={props.npmVersion}
        yarnVersion={props.yarnVersion}
        installedPlugins={props.installedPlugins}
      />,
    },
    app: {
      title: useCustomTitle(props, t('App Settings')),
      component: <AppSettingsPageContents />,
    },
    security: {
      title: useCustomTitle(props, t('security_settings')),
      component: <SecurityManagementContents />,
    },
    markdown: {
      title: useCustomTitle(props, t('Markdown Settings')),
      component: <MarkDownSettingContents />,
    },
    customize: {
      title: useCustomTitle(props, t('Customize Settings')),
      component: <CustomizeSettingContents />,
    },
    importer: {
      title: useCustomTitle(props, t('Import Data')),
      component: <DataImportPageContents />,
    },
    export: {
      title: useCustomTitle(props, t('Export Archive Data')),
      component: <ExportArchiveDataPage />,
    },
    notification: {
      title: useCustomTitle(props, t('Notification Settings')),
      component: <NotificationSetting />,
    },
    'global-notification': {
      title: '',
      component: <>global-notification</>,
    },
    'slack-integration': {
      title: useCustomTitle(props, t('slack_integration')),
      component: <SlackIntegration />,
    },
    'slack-integration-legacy': {
      title: useCustomTitle(props, t('Legacy_Slack_Integration')),
      component: <LegacySlackIntegration />,
    },
    users: {
      title: useCustomTitle(props, t('User_Management')),
      component: <UserManagement />,
      'external-accounts': {
        title: useCustomTitle(props, t('external_account_management')),
        component: <ManageExternalAccount />,
      },
    },
    'user-groups': {
      title: useCustomTitle(props, t('UserGroup Management')),
      component: <UserGroupPage />,
    },
    'user-group-detail': {
      [userGroupId]: {
        title: t('UserGroup Management'),
        component: <UserGroupDetailPage userGroupId={userGroupId} />,
      },
    },
    search: {
      title: useCustomTitle(props, t('Full Text Search Management')),
      component: <ElasticsearchManagement />,
    },
    'audit-log': {
      title: useCustomTitle(props, t('AuditLog')),
      component: <AuditLogManagement />,
    },
  };

  const getTargetPageToRender = (pagesMap, keys): {title: string, component: JSX.Element} => {
    return keys.reduce((pagesMap, key) => {
      return pagesMap[key];
    }, pagesMap);
  };

  const targetPage = getTargetPageToRender(adminPagesMap, pagePathKeys);

  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);
  // useIsMailerSetup(props.isMailerSetup);

  // useSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);

  useIsAclEnabled(props.isAclEnabled);
  useSiteUrl(props.siteUrl);

  // useEnvVars(props.envVars);

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
      <AdminLayout title={targetPage.title} selectedNavOpt={firstPath}>
        {targetPage.component}
      </AdminLayout>
    </Provider>
  );
};


function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { mailService } = crowi;

  props.isMailerSetup = mailService.isMailerSetup;
}

/**
 * for Server Side Translations
 * @param context
 * @param props
 * @param namespacesRequired
 */
async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, searchService, aclService,
  } = crowi;

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
  injectNextI18NextConfigurations(context, props, ['admin']);

  props.siteUrl = appService.getSiteUrl();
  props.nodeVersion = crowi.runtimeVersions.versions.node ? crowi.runtimeVersions.versions.node.version.version : null;
  props.npmVersion = crowi.runtimeVersions.versions.npm ? crowi.runtimeVersions.versions.npm.version.version : null;
  props.yarnVersion = crowi.runtimeVersions.versions.yarn ? crowi.runtimeVersions.versions.yarn.version.version : null;
  props.installedPlugins = pluginUtils.listPlugins();
  props.envVars = await ConfigLoader.getEnvVarsForDisplay(true);
  props.isAclEnabled = aclService.isAclEnabled();

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;

  return {
    props,
  };
};

export default AdminMarkdownSettingsPage;
