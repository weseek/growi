import { isPermalink, isUserPage, isUsersTopPage } from '@growi/core/dist/utils/page-path-utils';
import type {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { DrawioViewerScript } from '~/components/Script/DrawioViewerScript';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import { useHydrateSidebarAtoms } from '~/states/ui/sidebar/hydrate';

import type {
  CommonEachProps,
  CommonInitialProps, UserUISettingsProps,
} from './common-props';
import {
  getServerSideCommonEachProps, getServerSideCommonInitialProps, getServerSideI18nProps, getServerSideUserUISettingsProps,
} from './common-props';
import type { RendererConfigProps, SidebarConfigProps } from './general-page';
import { getServerSideRendererConfigProps, getServerSideSidebarConfigProps } from './general-page';
import { useCustomTitle } from './utils/page-title-customization';
import { mergeGetServerSidePropsResults } from './utils/server-side-props';

const SearchResultLayout = dynamic(() => import('~/components/Layout/SearchResultLayout'), { ssr: false });


type ServerConfigurationProps = {
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  isEnabledMarp: boolean,
}

type Props = CommonInitialProps & CommonEachProps & ServerConfigurationProps & RendererConfigProps & UserUISettingsProps & SidebarConfigProps;

const PrivateLegacyPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();

  const PrivateLegacyPages = dynamic(() => import('~/client/components/PrivateLegacyPages'), { ssr: false });

  // clear the cache for the current page
  //  in order to fix https://redmine.weseek.co.jp/issues/135811
  // useHydratePageAtoms(undefined);
  // useCurrentPathname('/_private-legacy-pages');

  // Search
  useIsSearchPage(true);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);
  useIsEnabledMarp(props.isEnabledMarp);

  // Hydrate sidebar atoms with server-side data
  useHydrateSidebarAtoms(props.sidebarConfig, props.userUISettings);

  const title = useCustomTitle(t('private_legacy_pages.title'));

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <DrawioViewerScript drawioUri={props.rendererConfig.drawioUri} />

      <SearchResultLayout>
        <div id="private-regacy-pages">
          <PrivateLegacyPages />
        </div>
      </SearchResultLayout>
    </>
  );
};

const getServerSideConfigurationProps: GetServerSideProps<ServerConfigurationProps> = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    configManager, searchService,
  } = crowi;

  return {
    props: {
      isSearchServiceConfigured: searchService.isConfigured,
      isSearchServiceReachable: searchService.isReachable,
      isSearchScopeChildrenAsDefault: configManager.getConfig('customize:isSearchScopeChildrenAsDefault'),
      isEnabledMarp: configManager.getConfig('customize:isEnabledMarp'),
    },
  };
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;

  // redirect to the page the user was on before moving to the Login Page
  if (req.headers.referer != null) {
    const urlBeforeLogin = new URL(req.headers.referer);
    if (isPermalink(urlBeforeLogin.pathname) || isUserPage(urlBeforeLogin.pathname) || isUsersTopPage(urlBeforeLogin.pathname)) {
      req.session.redirectTo = urlBeforeLogin.href;
    }
  }

  const [
    commonInitialResult,
    commonEachResult,
    userUIResult,
    rendererConfigResult,
    sidebarConfigResult,
    serverConfigResult,
    i18nPropsResult,
  ] = await Promise.all([
    getServerSideCommonInitialProps(context),
    getServerSideCommonEachProps(context),
    getServerSideUserUISettingsProps(context),
    getServerSideRendererConfigProps(context),
    getServerSideSidebarConfigProps(context),
    getServerSideConfigurationProps(context),
    getServerSideI18nProps(context, ['translation']),
  ]);

  return mergeGetServerSidePropsResults(commonInitialResult,
    mergeGetServerSidePropsResults(commonEachResult,
      mergeGetServerSidePropsResults(userUIResult,
        mergeGetServerSidePropsResults(rendererConfigResult,
          mergeGetServerSidePropsResults(sidebarConfigResult,
            mergeGetServerSidePropsResults(serverConfigResult, i18nPropsResult))))));
};

export default PrivateLegacyPage;
