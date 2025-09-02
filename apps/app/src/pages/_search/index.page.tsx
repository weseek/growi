import { useEffect } from 'react';

import { isPermalink, isUserPage, isUsersTopPage } from '@growi/core/dist/utils/page-path-utils';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { DrawioViewerScript } from '~/components/Script/DrawioViewerScript';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import { useIsSearchPage } from '~/states/context';
import { useHydrateSidebarAtoms } from '~/states/ui/sidebar/hydrate';

import type { NextPageWithLayout } from '../_app.page';
import type { CommonEachProps, CommonInitialProps, UserUISettingsProps } from '../common-props';
import {
  getServerSideCommonEachProps, getServerSideCommonInitialProps, getServerSideI18nProps, getServerSideUserUISettingsProps,
} from '../common-props';
import type { RendererConfigProps, SidebarConfigProps } from '../general-page';
import { getServerSideRendererConfigProps, getServerSideSidebarConfigProps } from '../general-page';
import { useCustomTitle } from '../utils/page-title-customization';
import { mergeGetServerSidePropsResults } from '../utils/server-side-props';

import type { ServerConfigurationProps } from './types';
import { useHydrateServerConfigurationAtoms } from './use-hydrate-server-configurations';

const SearchResultLayout = dynamic(() => import('~/components/Layout/SearchResultLayout'), { ssr: false });
const SearchPage = dynamic(() => import('~/client/components/SearchPage').then(mod => mod.SearchPage), { ssr: false });

type Props = CommonInitialProps & CommonEachProps & ServerConfigurationProps & RendererConfigProps & UserUISettingsProps & SidebarConfigProps;

const SearchResultPage: NextPageWithLayout<Props> = (props: Props) => {
  const router = useRouter();
  const { t } = useTranslation();

  // clear the cache for the current page
  //  in order to fix https://redmine.weseek.co.jp/issues/135811
  // useHydratePageAtoms(undefined);
  // useCurrentPathname('/_search');

  // const [, setSearchPage] = useIsSearchPage();

  // Hydrate server-side data
  useHydrateServerConfigurationAtoms(props.serverConfig, props.rendererConfig);
  useHydrateSidebarAtoms(props.sidebarConfig, props.userUISettings);

  const [, setIsSearchPage] = useIsSearchPage();

  // Turn on search page flag
  useEffect(() => {
    const resetPageContexts = () => {
      setIsSearchPage(true);
    };
    router.events.on('routeChangeComplete', resetPageContexts);
    return () => {
      router.events.off('routeChangeComplete', resetPageContexts);
    };
  }, [router, setIsSearchPage]);

  const title = useCustomTitle(t('search_result.title'));

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <DrawioViewerScript drawioUri={props.rendererConfig.drawioUri} />

      <SearchResultLayout>
        <SearchPage />
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
      serverConfig: {
        isSearchServiceConfigured: searchService.isConfigured,
        isSearchServiceReachable: searchService.isReachable,
        isSearchScopeChildrenAsDefault: configManager.getConfig('customize:isSearchScopeChildrenAsDefault'),
        isContainerFluid: configManager.getConfig('customize:isContainerFluid'),
      },
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

export default SearchResultPage;
