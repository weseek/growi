import React from 'react';

import { IUser, IUserHasId } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';

import { BasicLayout } from '~/components/Layout/BasicLayout';
import GrowiContextualSubNavigation from '~/components/Navbar/GrowiContextualSubNavigation';
import DisplaySwitcher from '~/components/Page/DisplaySwitcher';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { RendererConfig } from '~/interfaces/services/renderer';
import { IShareLinkHasId } from '~/interfaces/share-link';
import { IUserUISettings } from '~/interfaces/user-ui-settings';
import UserUISettings from '~/server/models/user-ui-settings';
import {
  useCurrentUser, useCurrentPagePath, useCurrentPathname, useCurrentPageId, useRendererConfig,
  useShareLinkId, useIsSearchServiceConfigured, useIsSearchServiceReachable, useIsSearchScopeChildrenAsDefault,
} from '~/stores/context';

import {
  CommonProps, getServerSideCommonProps, useCustomTitle, getNextI18NextConfig,
} from '../utils/commons';

const ShareLinkAlert = dynamic(() => import('~/components/Page/ShareLinkAlert'), { ssr: false });


type Props = CommonProps & {
  shareLink: IShareLinkHasId
  currentUser: IUser,
  userUISettings?: IUserUISettings,
  disableLinkSharing: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  rendererConfig: RendererConfig,
};

const SharedPage: NextPage<Props> = (props: Props) => {
  const {
    _id: shareLinkId, expiredAt, createdAt, relatedPage,
  } = props.shareLink;

  useShareLinkId(shareLinkId);
  useCurrentPageId(relatedPage._id);
  useCurrentPagePath(relatedPage.path);
  useCurrentUser(props.currentUser);
  useCurrentPathname(props.currentPathname);
  useRendererConfig(props.rendererConfig);
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

        <div id="content-main" className="content-main grw-container-convertible my-5">
          <ShareLinkAlert expiredAt={expiredAt} createdAt={createdAt} />

          <DisplaySwitcher />
        </div>
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

  props.rendererConfig = {
    isEnabledLinebreaks: crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
    isEnabledLinebreaksInComments: crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
    adminPreferredIndentSize: crowi.configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
    isIndentSizeForced: crowi.configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),

    plantumlUri: process.env.PLANTUML_URI ?? null,
    blockdiagUri: process.env.BLOCKDIAG_URI ?? null,

    // XSS Options
    isEnabledXssPrevention: crowi.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention'),
    attrWhiteList: crowi.xssService.getAttrWhiteList(),
    tagWhiteList: crowi.xssService.getTagWhiteList(),
    highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
  };
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

// MEMO: getServerSideProps でやっちゃっていいかも
// async function injectRoutingInformation(context: GetServerSidePropsContext, props: Props): Promise<void> {
//   const req: CrowiRequest = context.req as CrowiRequest;
//   const { crowi } = req;

//   const { linkId } = req.params;

//   const ShareLinkModel = crowi.model('ShareLink');
//   const shareLink = await ShareLinkModel.findOne({ _id: linkId }).populate('relatedPage');

//   if (props.disableLinkSharing) {
//     // forbidden
//   }

//   if (shareLink == null || shareLink.relatedPage == null || shareLink.relatedPage.isEmpty) {
//     // not found
//   }

//   if (shareLink.isExpired()) {
//     // exipred
//   }

//   props.shareLink = shareLink.toObject();
// }

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user, crowi } = req;
  const result = await getServerSideCommonProps(context);

  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }
  const props: Props = result.props as Props;

  if (user != null) {
    props.currentUser = user.toObject();
  }

  const { linkId } = req.params;

  const ShareLinkModel = crowi.model('ShareLink');
  const shareLink = await ShareLinkModel.findOne({ _id: linkId }).populate('relatedPage');

  if (shareLink != null) {
    props.shareLink = shareLink.toObject();
  }

  injectServerConfigurations(context, props);
  await injectUserUISettings(context, props);
  await injectNextI18NextConfigurations(context, props);

  return {
    props,
  };
};

export default SharedPage;
