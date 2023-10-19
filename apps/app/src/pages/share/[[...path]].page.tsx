import React, { useEffect } from 'react';

import type { IUserHasId, IPagePopulatedToShowRevision } from '@growi/core';
import type {
  GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import superjson from 'superjson';

import { useLayoutFluidClassNameByPage } from '~/client/services/layout';
import { ShareLinkLayout } from '~/components/Layout/ShareLinkLayout';
import GrowiContextualSubNavigationSubstance from '~/components/Navbar/GrowiContextualSubNavigation';
import { DrawioViewerScript } from '~/components/Script/DrawioViewerScript';
import { ShareLinkPageView } from '~/components/ShareLinkPageView';
import { SupportedAction, SupportedActionType } from '~/interfaces/activity';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { RendererConfig } from '~/interfaces/services/renderer';
import type { IShareLinkHasId } from '~/interfaces/share-link';
import type { PageDocument } from '~/server/models/page';
import {
  useCurrentUser, useRendererConfig, useIsSearchPage, useCurrentPathname, useIsNotFound,
  useShareLinkId, useIsSearchServiceConfigured, useIsSearchServiceReachable, useIsSearchScopeChildrenAsDefault, useIsContainerFluid, useIsEnabledMarp,
} from '~/stores/context';
import { useCurrentPageId, useSWRMUTxCurrentPage } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import type { NextPageWithLayout } from '../_app.page';
import {
  getServerSideCommonProps, generateCustomTitleForPage, getNextI18NextConfig, CommonProps, skipSSR,
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
  isEnabledMarp: boolean,
  drawioUri: string | null,
  rendererConfig: RendererConfig,
  skipSSR: boolean,
  ssrMaxRevisionBodyLength: number,
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
    <GrowiContextualSubNavigationSubstance currentPage={page} isLinkSharingDisabled={isLinkSharingDisabled} />
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
  useIsEnabledMarp(props.rendererConfig.isEnabledMarp);
  useIsContainerFluid(props.isContainerFluid);

  const { trigger: mutateCurrentPage, data: currentPage } = useSWRMUTxCurrentPage();

  useEffect(() => {
    if (!props.skipSSR) {
      return;
    }

    if (props.shareLink?.relatedPage._id != null && !props.isNotFound) {
      mutateCurrentPage();
    }
  }, [mutateCurrentPage, props.isNotFound, props.shareLink?.relatedPage._id, props.skipSSR]);


  const growiLayoutFluidClass = useLayoutFluidClassNameByPage(props.shareLinkRelatedPage);

  const pagePath = props.shareLinkRelatedPage?.path ?? '';

  const title = generateCustomTitleForPage(props, pagePath);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <div className={`dynamic-layout-root ${growiLayoutFluidClass} justify-content-between`}>
        <nav className="sticky-top">
          <GrowiContextualSubNavigationForSharedPage page={currentPage ?? props.shareLinkRelatedPage} isLinkSharingDisabled={props.disableLinkSharing} />
        </nav>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>

        <ShareLinkPageView
          pagePath={pagePath}
          rendererConfig={props.rendererConfig}
          page={currentPage ?? props.shareLinkRelatedPage}
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
    highlightJsStyleBorder: configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
  };

  props.ssrMaxRevisionBodyLength = configManager.getConfig('crowi', 'app:ssrMaxRevisionBodyLength');
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
      const ssrMaxRevisionBodyLength = crowi.configManager.getConfig('crowi', 'app:ssrMaxRevisionBodyLength');
      props.skipSSR = await skipSSR(shareLink.relatedPage, ssrMaxRevisionBodyLength);
      props.shareLinkRelatedPage = await shareLink.relatedPage.populateDataToShowRevision(props.skipSSR); // shouldExcludeBody = skipSSR
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
