import React from 'react';

import {
  IUser, IUserHasId,
} from '@growi/core';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { IUserUISettings } from '~/interfaces/user-ui-settings';
import UserUISettings from '~/server/models/user-ui-settings';

import { BasicLayout } from '../components/Layout/BasicLayout';
import GrowiContextualSubNavigation from '../components/Navbar/GrowiContextualSubNavigation';
import {
  useCurrentUser, useCurrentPageId, useCurrentPagePath, useCurrentPathname,
  useIsSearchServiceConfigured, useIsSearchServiceReachable,
  useIsSearchScopeChildrenAsDefault, useIsSearchPage,
} from '../stores/context';

import {
  CommonProps, getServerSideCommonProps, useCustomTitle,
} from './utils/commons';

const TrashPageList = dynamic(() => import('~/components/TrashPageList').then(mod => mod.TrashPageList), { ssr: false });
const EmptyTrashModal = dynamic(() => import('~/components/EmptyTrashModal'), { ssr: false });
const PutbackPageModal = dynamic(() => import('~/components/PutbackPageModal'), { ssr: false });

type Props = CommonProps & {
  currentUser: IUser,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  userUISettings?: IUserUISettings
};

const TrashPage: NextPage<CommonProps> = (props: Props) => {
  useCurrentUser(props.currentUser ?? null);

  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  useIsSearchPage(false);
  useCurrentPageId(null);
  useCurrentPathname('/trash');
  useCurrentPagePath('/trash');

  return (
    <>
      <BasicLayout title={useCustomTitle(props, 'GROWI')} >
        <header className="py-0 position-relative">
          <GrowiContextualSubNavigation isLinkSharingDisabled={false} />
        </header>

        <div className="grw-container-convertible mb-5 pb-5">
          <TrashPageList />
        </div>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>
      </BasicLayout>

      <EmptyTrashModal />
      <PutbackPageModal />
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

export default TrashPage;
