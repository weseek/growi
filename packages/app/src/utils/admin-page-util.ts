import {
  GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { SupportedActionType } from '~/interfaces/activity';
import { CrowiRequest } from '~/interfaces/crowi-request';
import {
  CommonProps, getServerSideCommonProps, getNextI18NextConfig,
} from '~/pages/utils/commons';
import PluginUtils from '~/server/plugins/plugin-utils';
import ConfigLoader from '~/server/service/config-loader';


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

const pluginUtils = new PluginUtils();


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

export const executeGetServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
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
