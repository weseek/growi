import type { ReactNode } from 'react';

import type { IUser } from '@growi/core';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import SearchResultLayout from '~/components/Layout/SearchResultLayout';
import { DrawioViewerScript } from '~/components/Script/DrawioViewerScript';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { RendererConfig } from '~/interfaces/services/renderer';
import {
  useCsrfToken, useCurrentUser, useIsContainerFluid, useIsSearchPage, useIsSearchScopeChildrenAsDefault,
  useIsSearchServiceConfigured, useIsSearchServiceReachable, useRendererConfig, useShowPageLimitationL, useGrowiCloudUri, useCurrentPathname,
} from '~/stores/context';
import { useCurrentPageId, useSWRxCurrentPage } from '~/stores/page';

import type { NextPageWithLayout } from './_app.page';
import type { CommonProps } from './utils/commons';
import {
  getNextI18NextConfig, getServerSideCommonProps, generateCustomTitle, useInitSidebarConfig,
} from './utils/commons';


const SearchPage = dynamic(() => import('../components/SearchPage').then(mod => mod.SearchPage), { ssr: false });


type Props = CommonProps & {
  currentUser: IUser,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,

  // Render config
  rendererConfig: RendererConfig,

  // search limit
  showPageLimitationL: number

  isContainerFluid: boolean,

};

const SearchResultPage: NextPageWithLayout<Props> = (props: Props) => {
  const { t } = useTranslation();

  // commons
  useCsrfToken(props.csrfToken);
  useGrowiCloudUri(props.growiCloudUri);

  useCurrentUser(props.currentUser ?? null);

  // clear the cache for the current page
  const { mutate } = useSWRxCurrentPage();
  useIsomorphicLayoutEffect(() => {
    mutate(undefined, { revalidate: false });
  }, []);

  useCurrentPageId(null);
  useCurrentPathname('/_search');

  // Search
  useIsSearchPage(true);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  // init sidebar config with UserUISettings and sidebarConfig
  useInitSidebarConfig(props.sidebarConfig, props.userUISettings);

  // render config
  useRendererConfig(props.rendererConfig);

  useShowPageLimitationL(props.showPageLimitationL);
  useIsContainerFluid(props.isContainerFluid);

  const title = generateCustomTitle(props, t('search_result.title'));

  console.log('_search');

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <SearchPage />
    </>
  );
};

type LayoutProps = Props & {
  children?: ReactNode
}

const Layout = ({ children, ...props }: LayoutProps): JSX.Element => {
  // init sidebar config with UserUISettings and sidebarConfig
  useInitSidebarConfig(props.sidebarConfig, props.userUISettings);

  return (
    <SearchResultLayout>
      {children}
    </SearchResultLayout>
  );
};

SearchResultPage.getLayout = function getLayout(page) {
  return (
    <>
      <DrawioViewerScript />
      <Layout {...page.props}>{page}</Layout>
    </>
  );
};

function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { configManager, searchService } = crowi;

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');
  props.isContainerFluid = configManager.getConfig('crowi', 'customize:isContainerFluid');

  props.sidebarConfig = {
    isSidebarCollapsedMode: configManager.getConfig('crowi', 'customize:isSidebarCollapsedMode'),
  };

  props.rendererConfig = {
    isEnabledLinebreaks: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
    isEnabledLinebreaksInComments: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
    isEnabledMarp: configManager.getConfig('crowi', 'customize:isEnabledMarp'),
    adminPreferredIndentSize: configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
    isIndentSizeForced: configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),

    drawioUri: configManager.getConfig('crowi', 'app:drawioUri'),
    plantumlUri: configManager.getConfig('crowi', 'app:plantumlUri'),

    // XSS Options
    isEnabledXssPrevention: configManager.getConfig('markdown', 'markdown:rehypeSanitize:isEnabledPrevention'),
    xssOption: configManager.getConfig('markdown', 'markdown:rehypeSanitize:option'),
    attrWhitelist: JSON.parse(crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:attributes')),
    tagWhitelist: crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:tagNames'),
    highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
  };

  props.showPageLimitationL = configManager.getConfig('crowi', 'customize:showPageLimitationL');
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
  const req = context.req as CrowiRequest;
  const { user } = req;

  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  if (user != null) {
    props.currentUser = user.toObject();
  }

  injectServerConfigurations(context, props);
  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default SearchResultPage;
