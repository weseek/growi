import React from 'react';

import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, getServerSideCommonProps, useCustomTitle } from '~/pages/commons';
import PluginUtils from '~/server/plugins/plugin-utils';
import ConfigLoader from '~/server/service/config-loader';
import {
  useCurrentUser, /* useSearchServiceConfigured, */ useIsSearchServiceReachable, useSiteUrl,
} from '~/stores/context';
// import { useEnvVars } from '~/stores/admin-context';

const AdminHome = dynamic(() => import('../../components/Admin/AdminHome/AdminHome'), { ssr: false });
const AppSettingsPageContents = dynamic(() => import('../../components/Admin/App/AppSettingsPageContents'), { ssr: false });
const SecurityManagementContents = dynamic(() => import('../../components/Admin/Notification/NotificationSetting'), { ssr: false });
const MarkDownSettingContents = dynamic(() => import('../../components/Admin/MarkdownSetting/MarkDownSettingContents'), { ssr: false });
const CustomizeSettingContents = dynamic(() => import('../../components/Admin/Customize/Customize'), { ssr: false });
const DataImportPageContents = dynamic(() => import('../../components/Admin/ImportData/ImportDataPageContents'), { ssr: false });
const ExportArchiveDataPage = dynamic(() => import('../../components/Admin/ExportArchiveDataPage'), { ssr: false });
const NotificationSetting = dynamic(() => import('../../components/Admin/Notification/NotificationSetting'), { ssr: false });
const SlackIntegration = dynamic(() => import('../../components/Admin/SlackIntegration/SlackIntegration'), { ssr: false });
const LegacySlackIntegration = dynamic(() => import('../../components/Admin/LegacySlackIntegration/LegacySlackIntegration'), { ssr: false });
const UserManagement = dynamic(() => import('../../components/Admin/UserManagement'), { ssr: false });
const UserGroupPage = dynamic(() => import('../../components/Admin/UserGroup/UserGroupPage'), { ssr: false });
const ElasticsearchManagement = dynamic(() => import('../../components/Admin/ElasticsearchManagement/ElasticsearchManagement'), { ssr: false });
// named export
const AuditLogManagement = dynamic(() => import('../../components/Admin/AuditLogManagement').then(module => module.AuditLogManagement));

const AdminLayout = dynamic(() => import('../../components/Layout/AdminLayout'), { ssr: false });

const pluginUtils = new PluginUtils();

type Props = CommonProps & {
  currentUser: any,

  nodeVersion: string,
  npmVersion: string,
  yarnVersion: string,
  installedPlugins: any,
  envVars: any,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,

  siteUrl: string,
};

const AdminMarkdownSettingsPage: NextPage<Props> = (props: Props) => {

  const { t } = useTranslation();
  const router = useRouter();
  const path = router.query.path || 'home';
  const name = Array.isArray(path) ? path[0] : path;

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
    },
    'user-groups': {
      title: useCustomTitle(props, t('UserGroup Management')),
      component: <UserGroupPage />,
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

  const content = adminPagesMap[name];
  const title = content.title;

  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);

  // useSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);

  useSiteUrl(props.siteUrl);

  // useEnvVars(props.envVars);

  return (
    <AdminLayout title={title} selectedNavOpt={name}>
      {content.component}
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, searchService,
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

  props.siteUrl = appService.getSiteUrl();
  props.nodeVersion = crowi.runtimeVersions.versions.node ? crowi.runtimeVersions.versions.node.version.version : null;
  props.npmVersion = crowi.runtimeVersions.versions.npm ? crowi.runtimeVersions.versions.npm.version.version : null;
  props.yarnVersion = crowi.runtimeVersions.versions.yarn ? crowi.runtimeVersions.versions.yarn.version.version : null;
  props.installedPlugins = pluginUtils.listPlugins();
  props.envVars = await ConfigLoader.getEnvVarsForDisplay(true);

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;

  return {
    props,
  };
};

export default AdminMarkdownSettingsPage;
