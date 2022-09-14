import React from 'react';

import { IPageHasId, IUser, IUserHasId } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { BasicLayout } from '~/components/Layout/BasicLayout';
import GrowiContextualSubNavigation from '~/components/Navbar/GrowiContextualSubNavigation';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { IUserUISettings } from '~/interfaces/user-ui-settings';
import UserUISettings from '~/server/models/user-ui-settings';
import {
  useIsSharedUser, useCurrentUser, useCurrentPagePath, useCurrentPathname, useCurrentPageId,
  useShareLinkId, useIsSearchServiceConfigured, useIsSearchServiceReachable, useIsSearchScopeChildrenAsDefault,
} from '~/stores/context';

import {
  CommonProps, getServerSideCommonProps, useCustomTitle, getNextI18NextConfig,
} from '../utils/commons';


type Props = CommonProps & {
  currentUser: IUser,
  pageId: string,
  pagePath: string,
  sharelinkId: string,
  userUISettings?: IUserUISettings,
  disableLinkSharing: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
};

const SharedPage: NextPage<Props> = (props: Props) => {
  useIsSharedUser(true);
  useCurrentUser(props.currentUser);
  useCurrentPageId(props.pageId);
  useCurrentPagePath(props.pagePath);
  useCurrentPathname(props.currentPathname);
  useShareLinkId(props.sharelinkId);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  return (
    <BasicLayout title={useCustomTitle(props, 'GROWI')} expandContainer={props.isContainerFluid}>
      <div className="h-100 d-flex flex-column justify-content-between">
        <header className="py-0 position-relative">
          <GrowiContextualSubNavigation isLinkSharingDisabled={props.disableLinkSharing} />
        </header>
        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>
      </div>
    </BasicLayout>
  );
};

function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;

  props.disableLinkSharing = crowi.configManager.getConfig('crowi', 'security:disableLinkSharing');

  props.isSearchServiceConfigured = crowi.searchService.isConfigured;
  props.isSearchServiceReachable = crowi.searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = crowi.configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');
}

async function injectUserUISettings(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;
  const userUISettings = user == null ? null : await UserUISettings.findOne({ user: user._id }).exec();

  if (userUISettings != null) {
    props.userUISettings = userUISettings.toObject();
  }
}

async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

async function injectRoutingInformation(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;

  const { linkId } = req.params;

  const ShareLinkModel = crowi.model('ShareLink');
  const shareLink = await ShareLinkModel.findOne({ _id: linkId }).populate('relatedPage');

  if (props.disableLinkSharing) {
    // forbidden
  }

  if (shareLink == null || shareLink.relatedPage == null || shareLink.relatedPage.isEmpty) {
    // not found
  }

  if (shareLink.isExpired()) {
    // exipred
  }

  const relatedPage = shareLink.relatedPage as IPageHasId;

  props.pageId = relatedPage._id;
  props.pagePath = relatedPage.path;
  props.sharelinkId = shareLink._id;
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
  await injectUserUISettings(context, props);
  await injectNextI18NextConfigurations(context, props);
  await injectRoutingInformation(context, props);

  return {
    props,
  };
};

export default SharedPage;
