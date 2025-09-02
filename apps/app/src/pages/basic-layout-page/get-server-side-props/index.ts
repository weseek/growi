import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

import { mergeGetServerSidePropsResults } from '../../utils/server-side-props';

import { getServerSideSearchConfigurationProps } from './search-configurations';
import { getServerSideSidebarConfigProps } from './sidebar-configurations';
import { getServerSideUserUISettingsProps } from './user-ui-settings';

export const getServerSideBasicLayoutProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const [
    searchConfigResult,
    sidebarConfigResult,
    userUIResult,
  ] = await Promise.all([
    getServerSideSearchConfigurationProps(context),
    getServerSideSidebarConfigProps(context),
    getServerSideUserUISettingsProps(context),
  ]);

  return mergeGetServerSidePropsResults(searchConfigResult,
    mergeGetServerSidePropsResults(sidebarConfigResult, userUIResult));
};
