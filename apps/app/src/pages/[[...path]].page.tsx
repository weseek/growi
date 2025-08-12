import type { ReactNode, JSX } from 'react';
import React, { useEffect } from 'react';


import EventEmitter from 'events';

import { isIPageInfo } from '@growi/core';
import type {
  IDataWithMeta,
} from '@growi/core';
import { isClient } from '@growi/core/dist/utils';
import { isPermalink } from '@growi/core/dist/utils/page-path-utils';
import { removeHeadingSlash } from '@growi/core/dist/utils/path-utils';
import type {
  GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import superjson from 'superjson';

import { BasicLayout } from '~/components/Layout/BasicLayout';
import { PageView } from '~/components/PageView/PageView';
import { DrawioViewerScript } from '~/components/Script/DrawioViewerScript';
import { useEditorModeClassName } from '~/services/layout/use-editor-mode-class-name';
import { useHydrateSidebarAtoms } from '~/states/hydrate/sidebar';
import {
  useCurrentPageData, useCurrentPageId, useCurrentPagePath, usePageNotFound,
} from '~/states/page';
import { useHydratePageAtoms } from '~/states/page/hydrate';
import {
  useDisableLinkSharing,
  useRendererConfig,
} from '~/states/server-configurations';
import { useHydrateServerConfigurationAtoms } from '~/states/server-configurations/hydrate';
import {
  useIsSharedUser,
  useIsSearchPage,
} from '~/stores-universal/context';
import { useEditingMarkdown } from '~/stores/editor';
import { useRedirectFrom } from '~/stores/page-redirect';
import { useSetupGlobalSocket, useSetupGlobalSocketForPage } from '~/stores/websocket';
import { useSWRMUTxCurrentPageYjsData } from '~/stores/yjs';

import { useSameRouteNavigation, useShallowRouting } from './[[...path]]/hooks';
import { getServerSidePropsForInitial, getServerSidePropsForSameRoute } from './[[...path]]/server-side-props';
import type {
  Props, InitialProps, SameRouteEachProps, IPageToShowRevisionWithMeta,
} from './[[...path]]/types';
import type { NextPageWithLayout } from './_app.page';
import { NextjsRoutingType, detectNextjsRoutingType } from './utils/nextjs-routing-utils';
import { generateCustomTitleForPage } from './utils/page-title-customization';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}

const GrowiContextualSubNavigationSubstance = dynamic(() => import('~/client/components/Navbar/GrowiContextualSubNavigation'), { ssr: false });

const GrowiPluginsActivator = dynamic(() => import('~/features/growi-plugin/client/components').then(mod => mod.GrowiPluginsActivator), { ssr: false });

const DisplaySwitcher = dynamic(() => import('~/client/components/Page/DisplaySwitcher').then(mod => mod.DisplaySwitcher), { ssr: false });
const PageStatusAlert = dynamic(() => import('~/client/components/PageStatusAlert').then(mod => mod.PageStatusAlert), { ssr: false });

const UnsavedAlertDialog = dynamic(() => import('~/client/components/UnsavedAlertDialog'), { ssr: false });
const DescendantsPageListModal = dynamic(
  () => import('~/client/components/DescendantsPageListModal').then(mod => mod.DescendantsPageListModal),
  { ssr: false },
);
const DrawioModal = dynamic(() => import('~/client/components/PageEditor/DrawioModal').then(mod => mod.DrawioModal), { ssr: false });
const HandsontableModal = dynamic(() => import('~/client/components/PageEditor/HandsontableModal').then(mod => mod.HandsontableModal), { ssr: false });
const TemplateModal = dynamic(() => import('~/client/components/TemplateModal').then(mod => mod.TemplateModal), { ssr: false });
const LinkEditModal = dynamic(() => import('~/client/components/PageEditor/LinkEditModal').then(mod => mod.LinkEditModal), { ssr: false });
const TagEditModal = dynamic(() => import('~/client/components/PageTags/TagEditModal').then(mod => mod.TagEditModal), { ssr: false });
const ConflictDiffModal = dynamic(() => import('~/client/components/PageEditor/ConflictDiffModal').then(mod => mod.ConflictDiffModal), { ssr: false });

const EditablePageEffects = dynamic(() => import('~/client/components/Page/EditablePageEffects').then(mod => mod.EditablePageEffects), { ssr: false });

type IPageToShowRevisionWithMetaSerialized = IDataWithMeta<string, string>;

superjson.registerCustom<IPageToShowRevisionWithMeta, IPageToShowRevisionWithMetaSerialized>(
  {
    isApplicable: (v): v is IPageToShowRevisionWithMeta => {
      return v?.data != null
        && v?.data.toObject != null
        && isIPageInfo(v.meta);
    },
    serialize: (v) => {
      return {
        data: superjson.stringify(v.data.toObject()),
        meta: superjson.stringify(v.meta),
      };
    },
    deserialize: (v) => {
      return {
        data: superjson.parse(v.data),
        meta: v.meta != null ? superjson.parse(v.meta) : undefined,
      };
    },
  },
  'IPageToShowRevisionWithMetaTransformer',
);

// GrowiContextualSubNavigation for NOT shared page
type GrowiContextualSubNavigationProps = {
  isLinkSharingDisabled: boolean,
}

const GrowiContextualSubNavigation = (props: GrowiContextualSubNavigationProps): JSX.Element => {
  const { isLinkSharingDisabled } = props;
  const [currentPage] = useCurrentPageData();
  return (
    <GrowiContextualSubNavigationSubstance currentPage={currentPage} isLinkSharingDisabled={isLinkSharingDisabled} />
  );
};

const extractPageIdFromPathname = (pathname: string): string | null => {
  if (isPermalink(pathname)) {
    return removeHeadingSlash(pathname);
  }
  return null;
};

const isInitialProps = (props: Props): props is (InitialProps & SameRouteEachProps) => {
  return 'isNextjsRoutingTypeInitial' in props && props.isNextjsRoutingTypeInitial;
};

const Page: NextPageWithLayout<Props> = (props: Props) => {
  // register global EventEmitter
  if (isClient() && window.globalEmitter == null) {
    window.globalEmitter = new EventEmitter();
  }

  useRedirectFrom(props.redirectFrom ?? null);
  useIsSharedUser(false); // this page can't be routed for '/share'
  useIsSearchPage(false);

  // Initialize Jotai atoms with initial data - must be called unconditionally
  const pageData = isInitialProps(props) ? props.pageWithMeta?.data : undefined;
  useHydratePageAtoms(pageData);

  const [currentPage] = useCurrentPageData();
  const [pageId] = useCurrentPageId();
  const [currentPagePath] = useCurrentPagePath();
  const [isNotFound] = usePageNotFound();
  const [rendererConfig] = useRendererConfig();
  const [disableLinkSharing] = useDisableLinkSharing();

  const { trigger: mutateCurrentPageYjsDataFromApi } = useSWRMUTxCurrentPageYjsData();

  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();

  useSetupGlobalSocket();
  useSetupGlobalSocketForPage(pageId);

  // Use custom hooks for navigation and routing
  useSameRouteNavigation(props, extractPageIdFromPathname, isInitialProps);
  useShallowRouting(props);

  // Load current yjs data - optimize to avoid unnecessary calls
  useEffect(() => {
    if (pageId != null && currentPage?.revision?._id != null && !isNotFound) {
      mutateCurrentPageYjsDataFromApi();
    }
  }, [currentPage?.revision?._id, mutateCurrentPageYjsDataFromApi, isNotFound, pageId]);

  // Initialize mutateEditingMarkdown only once per page change
  // Use currentPagePath not props.currentPathname to avoid unnecessary updates
  useEffect(() => {
    if (currentPagePath != null) {
      mutateEditingMarkdown(currentPage?.revision?.body);
    }
  }, [mutateEditingMarkdown, currentPage?.revision?.body, currentPagePath]);

  // If the data on the page changes without router.push, pageWithMeta remains old because getServerSideProps() is not executed
  // So preferentially take page data from useSWRxCurrentPage
  const pagePath = currentPagePath ?? props.currentPathname;

  const title = generateCustomTitleForPage(props, pagePath);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="dynamic-layout-root justify-content-between">

        <GrowiContextualSubNavigation isLinkSharingDisabled={disableLinkSharing} />

        <PageView
          className="d-edit-none"
          pagePath={pagePath}
          rendererConfig={rendererConfig}
        />

        <EditablePageEffects />
        <DisplaySwitcher />

        <PageStatusAlert />
      </div>
    </>
  );
};

const BasicLayoutWithEditor = ({ children }: { children?: ReactNode }): JSX.Element => {
  const editorModeClassName = useEditorModeClassName();
  return <BasicLayout className={editorModeClassName}>{children}</BasicLayout>;
};

type LayoutProps = Props & {
  children?: ReactNode
}

const Layout = ({ children, ...props }: LayoutProps): JSX.Element => {
  // Hydrate sidebar atoms with server-side data - must be called unconditionally
  const initialProps = isInitialProps(props) ? props : undefined;
  const sidebarConfig = initialProps?.sidebarConfig;
  const userUISettings = initialProps?.userUISettings;
  useHydrateSidebarAtoms(sidebarConfig, userUISettings);
  useHydrateServerConfigurationAtoms(initialProps);

  return <BasicLayoutWithEditor>{children}</BasicLayoutWithEditor>;
};

Page.getLayout = function getLayout(page: React.ReactElement<Props>) {
  // Get drawioUri from rendererConfig atom to ensure consistency across navigations
  const DrawioViewerScriptWithAtom = (): JSX.Element => {
    const [rendererConfig] = useRendererConfig();
    return <DrawioViewerScript drawioUri={rendererConfig.drawioUri} />;
  };

  return (
    <>
      <GrowiPluginsActivator />
      <DrawioViewerScriptWithAtom />

      <Layout {...page.props}>
        {page}
      </Layout>
      <UnsavedAlertDialog />
      <DescendantsPageListModal />
      <DrawioModal />
      <HandsontableModal />
      <TemplateModal />
      <LinkEditModal />
      <TagEditModal />
      <ConflictDiffModal />
    </>
  );
};

const NEXT_JS_ROUTING_PAGE = '[[...path]]';

export const getServerSideProps: GetServerSideProps<Props> = async(context: GetServerSidePropsContext) => {
  // detect Next.js routing type
  const nextjsRoutingType = detectNextjsRoutingType(context, NEXT_JS_ROUTING_PAGE);

  if (nextjsRoutingType === NextjsRoutingType.INITIAL) {
    return getServerSidePropsForInitial(context);
  }

  // Lightweight props for same-route navigation
  return getServerSidePropsForSameRoute(context);
};

export default Page;
