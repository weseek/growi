import type { ReactNode, JSX } from 'react';
import React, { useEffect } from 'react';

import type {
  GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { ShareLinkLayout } from '~/components/Layout/ShareLinkLayout';
import { DrawioViewerScript } from '~/components/Script/DrawioViewerScript';
import { ShareLinkPageView } from '~/components/ShareLinkPageView';
import type { SupportedActionType } from '~/interfaces/activity';
import { SupportedAction } from '~/interfaces/activity';
import type { CommonEachProps } from '~/pages/common-props';
import { NextjsRoutingType, detectNextjsRoutingType } from '~/pages/utils/nextjs-routing-utils';
import { useCustomTitleForPage } from '~/pages/utils/page-title-customization';
import { useIsSearchPage, useIsSharedUser } from '~/states/context';
import {
  useCurrentPageData, useCurrentPagePath,
} from '~/states/page';
import { useHydratePageAtoms } from '~/states/page/hydrate';
import { useDisableLinkSharing, useRendererConfig } from '~/states/server-configurations';
import { useHydrateServerConfigurationAtoms } from '~/states/server-configurations/hydrate';
import loggerFactory from '~/utils/logger';

import type { NextPageWithLayout } from '../../_app.page';
import type { InitialProps } from '../../general-page';
import { useInitialCSRFetch } from '../../general-page';
import { registerPageToShowRevisionWithMeta } from '../../general-page/superjson';

import { NEXT_JS_ROUTING_PAGE } from './consts';
import { getServerSidePropsForInitial, getServerSidePropsForSameRoute } from './server-side-props';
import type { ShareLinkPageProps } from './types';

// call superjson custom register
registerPageToShowRevisionWithMeta();


const GrowiContextualSubNavigation = dynamic(() => import('~/client/components/Navbar/GrowiContextualSubNavigation'), { ssr: false });


const logger = loggerFactory('growi:next-page:share');

type Props = ShareLinkPageProps &
  (CommonEachProps | (CommonEachProps & InitialProps));

const isInitialProps = (props: Props): props is (ShareLinkPageProps & InitialProps & CommonEachProps) => {
  return 'isNextjsRoutingTypeInitial' in props && props.isNextjsRoutingTypeInitial;
};

const SharedPage: NextPageWithLayout<Props> = (props: Props) => {

  const { shareLink, isExpired } = props;

  // Initialize Jotai atoms with initial data - must be called unconditionally
  const pageData = isInitialProps(props) ? props.pageWithMeta?.data : undefined;
  useHydratePageAtoms(pageData, {
    shareLinkId: props.shareLink?._id,
  });

  const [currentPage] = useCurrentPageData();
  const [currentPagePath] = useCurrentPagePath();
  const [rendererConfig] = useRendererConfig();
  const [, setIsSharedUser] = useIsSharedUser();
  const [, setIsSearchPage] = useIsSearchPage();
  const [isLinkSharingDisabled] = useDisableLinkSharing();

  // Use custom hooks for navigation and routing
  // useSameRouteNavigation();

  // If initial props and skipSSR, fetch page data on client-side
  useInitialCSRFetch(isInitialProps(props) && props.skipSSR);

  // Initialize atom values
  useEffect(() => {
    setIsSharedUser(true);
    setIsSearchPage(false);
  }, [setIsSharedUser, setIsSearchPage]);

  // If the data on the page changes without router.push, pageWithMeta remains old because getServerSideProps() is not executed
  // So preferentially take page data from useSWRxCurrentPage
  const pagePath = currentPagePath ?? props.currentPathname;

  const title = useCustomTitleForPage(pagePath);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <div className="dynamic-layout-root justify-content-between">

        <GrowiContextualSubNavigation currentPage={currentPage} />

        <ShareLinkPageView
          pagePath={pagePath}
          rendererConfig={rendererConfig}
          shareLink={shareLink}
          isExpired={isExpired}
          disableLinkSharing={isLinkSharingDisabled}
        />

      </div>
    </>
  );
};

type LayoutProps = Props & {
  children?: ReactNode
}

const Layout = ({ children, ...props }: LayoutProps): JSX.Element => {
  // Hydrate sidebar atoms with server-side data - must be called unconditionally
  const initialProps = isInitialProps(props) ? props : undefined;
  useHydrateServerConfigurationAtoms(initialProps?.serverConfig, initialProps?.rendererConfig);

  return <ShareLinkLayout>{children}</ShareLinkLayout>;
};

SharedPage.getLayout = function getLayout(page) {
  return (
    <>
      <DrawioViewerScript drawioUri={page.props.rendererConfig.drawioUri} />
      <Layout {...page.props}>
        {page}
      </Layout>
    </>
  );
};

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

export const getServerSideProps: GetServerSideProps<ShareLinkPageProps> = async(context: GetServerSidePropsContext) => {
  // detect Next.js routing type
  const nextjsRoutingType = detectNextjsRoutingType(context, NEXT_JS_ROUTING_PAGE);

  if (nextjsRoutingType === NextjsRoutingType.INITIAL) {
    return getServerSidePropsForInitial(context);
  }

  // Lightweight props for same-route navigation
  return getServerSidePropsForSameRoute(context);
};

export default SharedPage;
