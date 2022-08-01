import React, { useState, useCallback } from 'react';


import {
  IUser, IUserHasId,
} from '@growi/core';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';


import GrowiContextualSubNavigation from '~/components/Navbar/GrowiContextualSubNavigation';
import TagCloudBox from '~/components/TagCloudBox';
import TagList from '~/components/TagList';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { IDataTagCount } from '~/interfaces/tag';
import { IUserUISettings } from '~/interfaces/user-ui-settings';
import UserUISettings from '~/server/models/user-ui-settings';
import Xss from '~/services/xss';
import { useSWRxTagsList } from '~/stores/tag';

import { BasicLayout } from '../components/Layout/BasicLayout';
import {
  useCurrentUser,
  useIsSearchServiceConfigured, useIsSearchServiceReachable,
  useCsrfToken, useIsSearchScopeChildrenAsDefault,
} from '../stores/context';
import { useXss } from '../stores/xss';

import {
  CommonProps, getServerSideCommonProps, useCustomTitle,
} from './utils/commons';

const PAGING_LIMIT = 10;

type Props = CommonProps & {
  currentUser: IUser,

  isLatestRevision?: boolean,

  isIdenticalPathPage?: boolean,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,

  disableLinkSharing: boolean,

  userUISettings?: IUserUISettings
};

const TagPage: NextPage<CommonProps> = (props: Props) => {
  const [activePage, setActivePage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);

  const GrowiSubNavigationSwitcher = dynamic(() => import('../components/Navbar/GrowiSubNavigationSwitcher'), { ssr: false });

  useCurrentUser(props.currentUser ?? null);

  const { data: tagDataList, error } = useSWRxTagsList(PAGING_LIMIT, offset);
  const tagData: IDataTagCount[] = tagDataList?.data || [];
  const totalCount: number = tagDataList?.totalCount || 0;
  const isLoading = tagDataList === undefined && error == null;

  const { t } = useTranslation('');

  useXss(new Xss());

  useCsrfToken(props.csrfToken);

  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  const setOffsetByPageNumber = useCallback((selectedPageNumber: number) => {
    setActivePage(selectedPageNumber);
    setOffset((selectedPageNumber - 1) * PAGING_LIMIT);
  }, []);

  const classNames: string[] = [];

  return (
    <>
      <Head>
      </Head>
      <BasicLayout title={useCustomTitle(props, 'GROWI')} className={classNames.join(' ')}>
        <header className="py-0">
          <GrowiContextualSubNavigation isLinkSharingDisabled={props.disableLinkSharing} />
        </header>
        <div className="d-edit-none">
          <GrowiSubNavigationSwitcher />
        </div>
        <div id="grw-subnav-sticky-trigger" className="sticky-top"></div>
        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>
        <div className="grw-container-convertible mb-5 pb-5">
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
        </div>
      </BasicLayout>
    </>
  );
};

async function injectUserUISettings(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;

  const userUISettings = user == null ? null : await UserUISettings.findOne({ user: user._id }).exec();
  if (userUISettings != null) {
    props.userUISettings = userUISettings.toObject();
  }
}

function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    searchService, configManager,
  } = crowi;

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');
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
  await injectUserUISettings(context, props);
  injectServerConfigurations(context, props);

  return {
    props,
  };
};

export default TagPage;
