import React from 'react';

import { IUser, IUserHasId } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';

import { ShareLinkLayout } from '~/components/Layout/ShareLinkLayout';
import GrowiContextualSubNavigation from '~/components/Navbar/GrowiContextualSubNavigation';
import { Page } from '~/components/Page';
import { SupportedAction, SupportedActionType } from '~/interfaces/activity';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { RendererConfig } from '~/interfaces/services/renderer';
import { IShareLinkHasId } from '~/interfaces/share-link';
import {
  useCurrentUser, useCurrentPagePath, useCurrentPathname, useCurrentPageId, useRendererConfig, useIsSearchPage,
  useShareLinkId, useIsSearchServiceConfigured, useIsSearchServiceReachable, useIsSearchScopeChildrenAsDefault,
} from '~/stores/context';
import loggerFactory from '~/utils/logger';

import {
  CommonProps, getServerSideCommonProps, useCustomTitle, getNextI18NextConfig,
} from '../utils/commons';

const logger = loggerFactory('growi:next-page:share');

const ShareLinkAlert = dynamic(() => import('~/components/Page/ShareLinkAlert'), { ssr: false });
const ForbiddenPage = dynamic(() => import('~/components/ForbiddenPage'), { ssr: false });

type Props = CommonProps & {
  shareLink?: IShareLinkHasId,
  isExpired: boolean,
  currentUser: IUser,
  disableLinkSharing: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  rendererConfig: RendererConfig,
};

const SharedPage: NextPage<Props> = (props: Props) => {
  useIsSearchPage(false);
  useShareLinkId(props.shareLink?._id);
  useCurrentPageId(props.shareLink?.relatedPage._id);
  useCurrentPagePath(props.shareLink?.relatedPage.path);
  useCurrentUser(props.currentUser);
  useCurrentPathname(props.currentPathname);
  useRendererConfig(props.rendererConfig);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  const isNotFound = props.shareLink == null || props.shareLink.relatedPage == null || props.shareLink.relatedPage.isEmpty;
  const isShowSharedPage = !props.disableLinkSharing && !isNotFound && !props.isExpired;

  return (
    <ShareLinkLayout title={useCustomTitle(props, 'GROWI')} expandContainer={props.isContainerFluid}>
      <div className="h-100 d-flex flex-column justify-content-between">
        <header className="py-0 position-relative">
          {isShowSharedPage && <GrowiContextualSubNavigation isLinkSharingDisabled={props.disableLinkSharing} />}
        </header>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>

        <div className="flex-grow-1">
          <div id="content-main" className="content-main grw-container-convertible">
            { props.disableLinkSharing && (
              <div className="mt-4">
                <ForbiddenPage isLinkSharingDisabled={props.disableLinkSharing} />
              </div>
            )}

            { (isNotFound && !props.disableLinkSharing) && (
              <div className="container-lg">
                <h2 className="text-muted mt-4">
                  <i className="icon-ban" aria-hidden="true" />
                  <span> Page is not found</span>
                </h2>
              </div>
            )}

            { (props.isExpired && !props.disableLinkSharing) && (
              <div className="container-lg">
                <h2 className="text-muted mt-4">
                  <i className="icon-ban" aria-hidden="true" />
                  <span> Page is expired</span>
                </h2>
              </div>
            )}

            {(isShowSharedPage && props.shareLink != null) && (
              <>
                <ShareLinkAlert expiredAt={props.shareLink.expiredAt} createdAt={props.shareLink.createdAt} />
                <Page />
              </>
            )}
          </div>
        </div>
      </div>
    </ShareLinkLayout>
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

async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

function getAction(props: Props): SupportedActionType {
  let action: SupportedActionType;
  if (props.isExpired) {
    action = SupportedAction.ACTION_SHARE_LINK_EXPIRED_PAGE_VIEW;
  }
  else if (props.shareLink == null) {
    action = SupportedAction.ACTION_SHARE_LINK_NOT_FOUND;
  }
  else {
    action = SupportedAction.ACTION_SHARE_LINK_PAGE_VIEW;
  }

  return action;
}

async function addActivity(context: GetServerSidePropsContext, action: SupportedActionType): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;

  const parameters = {
    ip: req.ip,
    endpoint: req.originalUrl,
    action,
    user: req.user?._id,
    snapshot: {
      username: req.user?.username,
    },
  };

  await req.crowi.activityService.createActivity(parameters);
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user, crowi, params } = req;
  const result = await getServerSideCommonProps(context);

  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }
  const props: Props = result.props as Props;

  if (user != null) {
    props.currentUser = user.toObject();
  }

  try {
    const ShareLinkModel = crowi.model('ShareLink');
    const shareLink = await ShareLinkModel.findOne({ _id: params.linkId }).populate('relatedPage');
    if (shareLink != null) {
      props.isExpired = shareLink.isExpired();
      props.shareLink = shareLink.toObject();
    }
  }
  catch (err) {
    logger.error(err);
  }

  injectServerConfigurations(context, props);
  await injectNextI18NextConfigurations(context, props);
  await addActivity(context, getAction(props));

  return {
    props,
  };
};

export default SharedPage;
