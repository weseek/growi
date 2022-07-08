import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';

import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import AdminLayout from '~/components/AdminLayout';

import { useTranslation } from 'next-i18next';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, getServerSideCommonProps, useCustomTitle } from '~/pages/commons';
import PluginUtils from '~/server/plugins/plugin-utils';
import ConfigLoader from '~/server/service/config-loader';

// import AdminHome from '~/components/Admin/AdminHome/AdminHome';
// import AppSettingsPageContents from '~/components/Admin/App/AppSettingsPageContents';
// import SecurityManagementContents from '~/components/Admin/Security/SecurityManagementContents';
// import MarkDownSettingContents from '~/components/Admin/MarkdownSetting/MarkDownSettingContents';
// import DataImportPageContents from '~/components/Admin/ImportData/ImportDataPageContents';
// import ExportArchiveDataPage from '~/components/Admin/ExportArchiveDataPage';
// import ElasticsearchManagement from '~/components/Admin/ElasticsearchManagement/ElasticsearchManagement';
import UserGroupPage from '~/components/Admin/UserGroup/UserGroupPage';
import UserManagement from '~/components/Admin/UserManagement';

import {
  useCurrentUser,
 /* useSearchServiceConfigured, useSearchServiceReachable,*/ useSiteUrl,
} from '~/stores/context';
// import { useEnvVars } from '~/stores/admin-context';

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
  console.log('AdminMarkdownSettingsPage_props', props)

  const { t } = useTranslation();
  const router = useRouter();
  const path = router.query.path || 'home';
  const name = Array.isArray(path) ? path[0] : path;

  // const CustomizeSettingContents = dynamic(() => import('../../components/Admin/Customize/Customize'), { ssr: false });

  const adminPagesMap = {
    home: {
      title: useCustomTitle(props, t('Wiki Management Home Page')),
      // component: <AdminHome
      //   nodeVersion={props.nodeVersion}
      //   npmVersion={props.npmVersion}
      //   yarnVersion={props.yarnVersion}
      //   installedPlugins={props.installedPlugins}
      // />,
      component: <>AdminHome</>,
    },
    app: {
      title: useCustomTitle(props, t('App Settings')),
      // component: <AppSettingsPageContents />,
      component: <>AppSettingsPageContents</>,
    },
    security: {
      title: useCustomTitle(props, t('security_settings')),
      // component: <SecurityManagementContents />,
      component: <>SecurityManagementContents</>,
    },
    markdown: {
      title: useCustomTitle(props, t('Markdown Settings')),
      // component: <MarkDownSettingContents />,
      component: <>MarkDownSettingContents</>,
    },
    customize: {
      title: useCustomTitle(props, t('Customize Settings')),
      // component: <CustomizeSettingContents />,
      component: <>CustomizeSettingContents</>,
    },
    importer: {
      title: useCustomTitle(props, t('Import Data')),
      // component: <DataImportPageContents />,
      component: <>DataImportPageContents</>,
    },
    export: {
      title: useCustomTitle(props, t('Export Archive Data')),
      // component: <ExportArchiveDataPage />,
      component: <>ExportArchiveDataPage</>,
    },
    notification: {
      title: useCustomTitle(props, t('Notification Settings')),
      component: <>notification</>,
    },
    'global-notification': {
      title: '',
      component: <>global-notification</>,
    },
    users: {
      title: useCustomTitle(props, t('User_Management')),
      // component: <UserManagement />,
      component: <>UserManagement</>,
    },
    'user-groups': {
      title: useCustomTitle(props, t('UserGroup Management')),
      component: <>user-groups</>,
    },
    search: {
      title: useCustomTitle(props, t('Full Text Search Management')),
      // component: <ElasticsearchManagement />,
      component: <>ElasticsearchManagement</>,
    },
  };

  const content = adminPagesMap[name];
  const title = content.title;

  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);

  // useSearchServiceConfigured(props.isSearchServiceConfigured);
  // useSearchServiceReachable(props.isSearchServiceReachable);

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
