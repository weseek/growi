import React, { useState, useCallback } from 'react';

import type { IUser, IUserHasId } from '@growi/core';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { IDataTagCount } from '~/interfaces/tag';
import type { IUserUISettings } from '~/interfaces/user-ui-settings';
import type { UserUISettingsModel } from '~/server/models/user-ui-settings';
import { useSWRxTagsList } from '~/stores/tag';

import { BasicLayout } from '../components/Layout/BasicLayout';
import {
  useCurrentUser, useIsSearchPage,
  useIsSearchServiceConfigured, useIsSearchServiceReachable,
  useIsSearchScopeChildrenAsDefault,
} from '../stores/context';

import {
  CommonProps, getServerSideCommonProps, useCustomTitle,
} from './utils/commons';

const PAGING_LIMIT = 10;

type Props = CommonProps & {
  currentUser: IUser,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  userUISettings?: IUserUISettings
};

const TagList = dynamic(() => import('~/components/TagList'), { ssr: false });
const TagCloudBox = dynamic(() => import('~/components/TagCloudBox'), { ssr: false });

const TagPage: NextPage<CommonProps> = (props: Props) => {
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
  const classNames: string[] = [];

  useIsSearchPage(false);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  return (
    <>
      <Head>
      </Head>
      <BasicLayout title={useCustomTitle(props, 'GROWI')} className={classNames.join(' ')}>
        <div className="grw-container-convertible mb-5 pb-5" data-testid="tags-page">
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
      </BasicLayout>
    </>
  );
};

async function injectUserUISettings(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const { model: mongooseModel } = await import('mongoose');

  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;

  const UserUISettings = mongooseModel('UserUISettings') as UserUISettingsModel;
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
