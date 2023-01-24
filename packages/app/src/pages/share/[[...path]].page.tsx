import React from 'react';

import { IUserHasId, IPagePopulatedToShowRevision } from '@growi/core';
import {
  GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import superjson from 'superjson';

import { useCurrentGrowiLayoutFluidClassName } from '~/client/services/layout';
import { MainPane } from '~/components/Layout/MainPane';
import { ShareLinkLayout } from '~/components/Layout/ShareLinkLayout';
import GrowiContextualSubNavigationSubstance from '~/components/Navbar/GrowiContextualSubNavigation';
import RevisionRenderer from '~/components/Page/RevisionRenderer';
import ShareLinkAlert from '~/components/Page/ShareLinkAlert';
import type { PageSideContentsProps } from '~/components/PageSideContents';
import { DrawioViewerScript } from '~/components/Script/DrawioViewerScript';
import { SupportedAction, SupportedActionType } from '~/interfaces/activity';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { RendererConfig } from '~/interfaces/services/renderer';
import { IShareLinkHasId } from '~/interfaces/share-link';
import type { PageDocument } from '~/server/models/page';
import { generateSSRViewOptions } from '~/services/renderer/renderer';
import {
  useCurrentUser, useCurrentPageId, useRendererConfig, useIsSearchPage, useCurrentPathname,
  useShareLinkId, useIsSearchServiceConfigured, useIsSearchServiceReachable, useIsSearchScopeChildrenAsDefault, useDrawioUri, useIsContainerFluid,
} from '~/stores/context';
import loggerFactory from '~/utils/logger';

import { NextPageWithLayout } from '../_app.page';
import {
  CommonProps, getServerSideCommonProps, generateCustomTitleForPage, getNextI18NextConfig,
} from '../utils/commons';

const logger = loggerFactory('growi:next-page:share');

const PageSideContents = dynamic<PageSideContentsProps>(() => import('~/components/PageSideContents').then(mod => mod.PageSideContents), { ssr: false });
// const Comments = dynamic(() => import('~/components/Comments').then(mod => mod.Comments), { ssr: false });
const ForbiddenPage = dynamic(() => import('~/components/ForbiddenPage'), { ssr: false });

type Props = CommonProps & {
  shareLinkRelatedPage?: IShareLinkRelatedPage,
  shareLink?: IShareLinkHasId,
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
  currentPage?: IPagePopulatedToShowRevision,
  isLinkSharingDisabled: boolean,
}

const GrowiContextualSubNavigationForSharedPage = (props: GrowiContextualSubNavigationForSharedPageProps): JSX.Element => {
  const { currentPage, isLinkSharingDisabled } = props;
  if (currentPage == null) { return <></> }
  return (
    <div data-testid="grw-contextual-sub-nav">
      <GrowiContextualSubNavigationSubstance currentPage={currentPage} isLinkSharingDisabled={isLinkSharingDisabled}/>
    </div>
  );
};

const SharedPage: NextPageWithLayout<Props> = (props: Props) => {
  useCurrentPathname(props.shareLink?.relatedPage.path);
  useIsSearchPage(false);
  useShareLinkId(props.shareLink?._id);
  useCurrentPageId(props.shareLink?.relatedPage._id);
  useCurrentUser(props.currentUser);
  useRendererConfig(props.rendererConfig);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);
  useDrawioUri(props.drawioUri);
  useIsContainerFluid(props.isContainerFluid);


  const growiLayoutFluidClass = useCurrentGrowiLayoutFluidClassName();

  const isNotFound = props.shareLink == null || props.shareLink.relatedPage == null || props.shareLink.relatedPage.isEmpty;
  const isShowSharedPage = !props.disableLinkSharing && !isNotFound && !props.isExpired;
  const shareLink = props.shareLink;

  const pagePath = props.shareLinkRelatedPage?.path ?? '';
  const revisionBody = props.shareLinkRelatedPage?.revision.body;

  const title = generateCustomTitleForPage(props, pagePath);

  const rendererOptions = generateSSRViewOptions(props.rendererConfig, pagePath);
  const ssrBody = <RevisionRenderer rendererOptions={rendererOptions} markdown={revisionBody ?? ''} />;

  const sideContents = shareLink != null
    ? <PageSideContents page={shareLink.relatedPage} />
    : <></>;

  // const footerContents = shareLink != null && isPopulated(shareLink.relatedPage.revision)
  //   ? (
  //     <>
  //       <Comments pageId={shareLink._id} pagePath={shareLink.relatedPage.path} revision={shareLink.relatedPage.revision} />
  //     </>
  //   )
  //   : <></>;

  const contents = (() => {
    const PageContents = dynamic(() => import('~/components/Page/PageContents').then(mod => mod.PageContents), {
      ssr: false,
      loading: () => ssrBody,
    });
    return <PageContents />;
  })();

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <div className={`dynamic-layout-root ${growiLayoutFluidClass} h-100 d-flex flex-column justify-content-between`}>
        <header className="py-0 position-relative">
          {isShowSharedPage
          && <GrowiContextualSubNavigationForSharedPage currentPage={props.shareLinkRelatedPage} isLinkSharingDisabled={props.disableLinkSharing} />}
        </header>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>

        <MainPane
          sideContents={sideContents}
          // footerContents={footerContents}
        >
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

          { (props.isExpired && !props.disableLinkSharing && shareLink != null) && (
            <div className="container-lg">
              <ShareLinkAlert expiredAt={shareLink.expiredAt} createdAt={shareLink.createdAt} />
              <h2 className="text-muted mt-4">
                <i className="icon-ban" aria-hidden="true" />
                <span> Page is expired</span>
              </h2>
            </div>
          )}

          {(isShowSharedPage && shareLink != null) && (
            <>
              <ShareLinkAlert expiredAt={shareLink.expiredAt} createdAt={shareLink.createdAt} />
              <div className="mb-5">
                { contents }
              </div>
            </>
          )}
        </MainPane>

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
  const { configManager, searchService, xssService } = crowi;

  props.disableLinkSharing = configManager.getConfig('crowi', 'security:disableLinkSharing');

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');

  props.drawioUri = configManager.getConfig('crowi', 'app:drawioUri');

  props.rendererConfig = {
    isEnabledLinebreaks: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
    isEnabledLinebreaksInComments: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
    adminPreferredIndentSize: configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
    isIndentSizeForced: configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),

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
    if (shareLink != null) {
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
