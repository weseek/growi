import React, { useState, useCallback, ReactNode } from 'react';

import type { IUser, IUserHasId } from '@growi/core';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { RendererConfig } from '~/interfaces/services/renderer';
import type { IDataTagCount } from '~/interfaces/tag';
import { useSWRxTagsList } from '~/stores/tag';

import { BasicLayout } from '../components/Layout/BasicLayout';
import {
  useCurrentUser, useIsSearchPage,
  useIsSearchServiceConfigured, useIsSearchServiceReachable,
  useIsSearchScopeChildrenAsDefault, useGrowiCloudUri,
} from '../stores/context';

import { NextPageWithLayout } from './_app.page';
import type { CommonProps } from './utils/commons';
import {
  getServerSideCommonProps, getNextI18NextConfig, generateCustomTitle, useInitSidebarConfig,
} from './utils/commons';

const PAGING_LIMIT = 10;

type Props = CommonProps & {
  currentUser: IUser,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,

  rendererConfig: RendererConfig,
};

const TagList = dynamic(() => import('~/components/TagList'), { ssr: false });
const TagCloudBox = dynamic(() => import('~/components/TagCloudBox'), { ssr: false });

const TagPage: NextPageWithLayout<CommonProps> = (props: Props) => {
  const [activePage, setActivePage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);

  useCurrentUser(props.currentUser ?? null);
  const { data: tagDataList, error } = useSWRxTagsList(PAGING_LIMIT, offset);
  const { t } = useTranslation('');
  const setOffsetByPageNumber = useCallback((selectedPageNumber: number) => {
    setActivePage(selectedPageNumber);
    setOffset((selectedPageNumber - 1) * PAGING_LIMIT);
  }, []);

  const tagData: IDataTagCount[] = tagDataList?.data || [];
  const totalCount: number = tagDataList?.totalCount || 0;
  const isLoading = tagDataList === undefined && error == null;

  useGrowiCloudUri(props.growiCloudUri);

  useIsSearchPage(false);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  // init sidebar config with UserUISettings and sidebarConfig
  useInitSidebarConfig(props.sidebarConfig, props.userUISettings);

  const title = generateCustomTitle(props, t('Tags'));

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="dynamic-layout-root">
        <div className="grw-container-convertible container-lg mb-5 pb-5" data-testid="tags-page">
          <h2 className="my-3">{`${t('Tags')}(${totalCount})`}</h2>
          <div className="px-3 mb-5 text-center">
            <TagCloudBox tags={tagData} minSize={20} />
          </div>
          { isLoading
            ? (
              <div className="text-muted text-center">
                <i className="fa fa-2x fa-spinner fa-pulse mt-3"></i>
              </div>
            )
            : (
              <div data-testid="grw-tags-list">
                <TagList
                  tagData={tagData}
                  totalTags={totalCount}
                  activePage={activePage}
                  onChangePage={setOffsetByPageNumber}
                  pagingLimit={PAGING_LIMIT}
                />
              </div>
            )
          }
          <div id="grw-fav-sticky-trigger" className="sticky-top"></div>
        </div>
      </div>
    </>
  );
};

type LayoutProps = Props & {
  children?: ReactNode
}

const Layout = ({ children, ...props }: LayoutProps): JSX.Element => {
  // init sidebar config with UserUISettings and sidebarConfig
  useInitSidebarConfig(props.sidebarConfig, props.userUISettings);

  return <BasicLayout>{children}</BasicLayout>;
};

TagPage.getLayout = function getLayout(page) {
  return (
    <Layout {...page.props}>
      {page}
    </Layout>
  );
};

function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    searchService, configManager,
  } = crowi;

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');

  props.sidebarConfig = {
    isSidebarDrawerMode: configManager.getConfig('crowi', 'customize:isSidebarDrawerMode'),
    isSidebarClosedAtDockMode: configManager.getConfig('crowi', 'customize:isSidebarClosedAtDockMode'),
  };

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
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;
  const result = await getServerSideCommonProps(context);

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

export default TagPage;
