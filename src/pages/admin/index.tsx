import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';

import { useTranslation } from '~/i18n';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, getServerSideCommonProps } from '~/utils/nextjs-page-utils';
import AdminHome from '~/client/js/components/Admin/AdminHome/AdminHome';
import PluginUtils from '~/server/plugins/plugin-utils';
import ConfigLoader from '~/server/service/config-loader';

import {
  useCurrentUser,
  useSearchServiceConfigured, useSearchServiceReachable,
} from '../../stores/context';

import AdminLayout from '~/components/AdminLayout';


const pluginUtils = new PluginUtils();

type Props = CommonProps & {
  currentUser: any,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,

  growiVersion: string,
  nodeVersion: string,
  npmVersion: string,
  yarnVersion: string,
  installedPlugins: any,
  envVars: any,
};

const AdminHomePage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();
  const title = t('Wiki Management Home Page');

  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);

  useSearchServiceConfigured(props.isSearchServiceConfigured);
  useSearchServiceReachable(props.isSearchServiceReachable);

  return (
    <AdminLayout title={title} selectedNavOpt="home" growiVersion={props.growiVersion}>
      <AdminHome
        growiVersion={props.growiVersion}
        nodeVersion={props.nodeVersion}
        npmVersion={props.npmVersion}
        yarnVersion={props.yarnVersion}
        installedPlugins={props.installedPlugins}
        envVars={props.envVars}
      />
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    searchService,
  } = crowi;

  const { user } = req;

  const result = await getServerSideCommonProps(context);
  const props: Props = result.props as Props;
  if (user != null) {
    props.currentUser = JSON.stringify(user.toObject());
  }

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;

  props.growiVersion = crowi.version;
  props.nodeVersion = crowi.runtimeVersions.versions.node ? crowi.runtimeVersions.versions.node.version.version : '-';
  props.npmVersion = crowi.runtimeVersions.versions.npm ? crowi.runtimeVersions.versions.npm.version.version : '-';
  props.yarnVersion = crowi.runtimeVersions.versions.yarn ? crowi.runtimeVersions.versions.yarn.version.version : '-';
  props.installedPlugins = pluginUtils.listPlugins();
  props.envVars = await ConfigLoader.getEnvVarsForDisplay(true);

  return {
    props,
  };
};

export default AdminHomePage;
