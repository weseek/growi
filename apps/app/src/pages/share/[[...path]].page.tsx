import React from 'react';

import type { IUserHasId, IPagePopulatedToShowRevision } from '@growi/core';
import type {
  GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import superjson from 'superjson';

import { useCurrentGrowiLayoutFluidClassName } from '~/client/services/layout';
import { ShareLinkLayout } from '~/components/Layout/ShareLinkLayout';
import GrowiContextualSubNavigationSubstance from '~/components/Navbar/GrowiContextualSubNavigation';
import { DrawioViewerScript } from '~/components/Script/DrawioViewerScript';
import { ShareLinkPageView } from '~/components/ShareLink/ShareLinkPageView';
import { SupportedAction, SupportedActionType } from '~/interfaces/activity';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { RendererConfig } from '~/interfaces/services/renderer';
import type { IShareLinkHasId } from '~/interfaces/share-link';
import type { PageDocument } from '~/server/models/page';
import {
  useCurrentUser, useRendererConfig, useIsSearchPage, useCurrentPathname,
  useShareLinkId, useIsSearchServiceConfigured, useIsSearchServiceReachable, useIsSearchScopeChildrenAsDefault, useIsContainerFluid,
} from '~/stores/context';
import { useCurrentPageId, useIsNotFound } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import type { NextPageWithLayout } from '../_app.page';
import {
  getServerSideCommonProps, generateCustomTitleForPage, getNextI18NextConfig, CommonProps,
} from '../utils/commons';

const logger = loggerFactory('growi:next-page:share');

type Props = CommonProps & {
  shareLinkRelatedPage?: IShareLinkRelatedPage,
  shareLink?: IShareLinkHasId,
  isNotFound: boolean,
  isExpired: boolean,
  disableLinkSharing: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  drawioUri: string | null,
  rendererConfig: RendererConfig,
};

type IShareLinkRelatedPage = IPagePopulatedToShowRevision & PageDocument;

superjson.registerCustom<IShareLinkRelatedPage, string>(
  {
    isApplicable: (v): v is IShareLinkRelatedPage => {
      return v != null
        && v.toObject != null
        && v.lastUpdateUser != null
        && v.creator != null
        && v.revision != null;
    },
    serialize: (v) => { return superjson.stringify(v.toObject()) },
    deserialize: (v) => { return superjson.parse(v) },
  },
  'IShareLinkRelatedPageTransformer',
);

// GrowiContextualSubNavigation for shared page
// get page info from props not to send request 'GET /page' from client
type GrowiContextualSubNavigationForSharedPageProps = {
  page?: IPagePopulatedToShowRevision,
  isLinkSharingDisabled: boolean,
}

const GrowiContextualSubNavigationForSharedPage = (props: GrowiContextualSubNavigationForSharedPageProps): JSX.Element => {
  const { page, isLinkSharingDisabled } = props;

  return (
    <div data-testid="grw-contextual-sub-nav">
      <GrowiContextualSubNavigationSubstance currentPage={page} isLinkSharingDisabled={isLinkSharingDisabled}/>
    </div>
  );
};

const SharedPage: NextPageWithLayout<Props> = (props: Props) => {
  useCurrentPathname(props.shareLink?.relatedPage.path);
  useIsSearchPage(false);
  useIsNotFound(props.isNotFound);
  useShareLinkId(props.shareLink?._id);
  useCurrentPageId(props.shareLink?.relatedPage._id);
  useCurrentUser(props.currentUser);
  useRendererConfig(props.rendererConfig);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);
  useIsContainerFluid(props.isContainerFluid);


  const growiLayoutFluidClass = useCurrentGrowiLayoutFluidClassName(props.shareLinkRelatedPage);

  const pagePath = props.shareLinkRelatedPage?.path ?? '';

  const title = generateCustomTitleForPage(props, pagePath);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <div className={`dynamic-layout-root ${growiLayoutFluidClass} h-100 d-flex flex-column justify-content-between`}>
        <header className="py-0 position-relative">
          <GrowiContextualSubNavigationForSharedPage page={props.shareLinkRelatedPage} isLinkSharingDisabled={props.disableLinkSharing} />
        </header>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>

        <ShareLinkPageView
          pagePath={pagePath}
          rendererConfig={props.rendererConfig}
          page={props.shareLinkRelatedPage}
          shareLink={props.shareLink}
          isExpired={props.isExpired}
          disableLinkSharing={props.disableLinkSharing}
        />

      </div>
    </>
  );
};

SharedPage.getLayout = function getLayout(page) {
  return (
    <>
      <DrawioViewerScript />
      <ShareLinkLayout>{page}</ShareLinkLayout>
    </>
  );
};

function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { configManager, searchService } = crowi;

  props.disableLinkSharing = configManager.getConfig('crowi', 'security:disableLinkSharing');

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');

  props.drawioUri = configManager.getConfig('crowi', 'app:drawioUri');

  props.rendererConfig = {
    isSharedPage: true,
    isEnabledLinebreaks: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
    isEnabledLinebreaksInComments: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
    adminPreferredIndentSize: configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
    isIndentSizeForced: configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),

    drawioUri: configManager.getConfig('crowi', 'app:drawioUri'),
    plantumlUri: process.env.PLANTUML_URI ?? null,
    blockdiagUri: process.env.BLOCKDIAG_URI ?? null,

    // XSS Options
    isEnabledXssPrevention: configManager.getConfig('markdown', 'markdown:rehypeSanitize:isEnabledPrevention'),
    xssOption: configManager.getConfig('markdown', 'markdown:rehypeSanitize:option'),
    attrWhiteList: JSON.parse(crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:attributes')),
    tagWhiteList: crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:tagNames'),
    highlightJsStyleBorder: configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
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
  const { crowi, params } = req;
  const result = await getServerSideCommonProps(context);

  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }
  const props: Props = result.props as Props;

  try {
    const ShareLinkModel = crowi.model('ShareLink');
    const shareLink = await ShareLinkModel.findOne({ _id: params.linkId }).populate('relatedPage');
    if (shareLink == null) {
      props.isNotFound = true;
    }
    else {
      props.isNotFound = false;
      props.shareLinkRelatedPage = await shareLink.relatedPage.populateDataToShowRevision();
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
