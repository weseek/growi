import type { ReactNode, JSX } from 'react';
import React, { useEffect } from 'react';

import EventEmitter from 'events';

import { isIPageInfo } from '@growi/core';
import type {
  IDataWithMeta,
} from '@growi/core';
import {
  isClient,
} from '@growi/core/dist/utils';
import type {
  GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import superjson from 'superjson';

import { BasicLayout } from '~/components/Layout/BasicLayout';
import { PageView } from '~/components/PageView/PageView';
import { DrawioViewerScript } from '~/components/Script/DrawioViewerScript';
import { useEditorModeClassName } from '~/services/layout/use-editor-mode-class-name';
import { useHydrateSidebarAtoms } from '~/states/hydrate/sidebar';
import {
  useCurrentPageData, useFetchCurrentPage, useCurrentPageId, useCurrentPagePath, usePageNotFound,
} from '~/states/page';
import { useHydratePageAtoms } from '~/states/page/hydrate';
import {
  useDisableLinkSharing,
  useRendererConfig,
} from '~/states/server-configurations/server-configurations';
import {
  useIsSharedUser,
  useIsSearchPage,
} from '~/stores-universal/context';
import { useEditingMarkdown } from '~/stores/editor';
import { useRedirectFrom } from '~/stores/page-redirect';
import { useSetupGlobalSocket, useSetupGlobalSocketForPage } from '~/stores/websocket';
import { useSWRMUTxCurrentPageYjsData } from '~/stores/yjs';

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

const isInitialProps = (props: Props): props is (InitialProps & SameRouteEachProps) => {
  return props.nextjsRoutingPage === NextjsRoutingType.INITIAL;
};

const Page: NextPageWithLayout<Props> = (props: Props) => {
  // register global EventEmitter
  if (isClient() && window.globalEmitter == null) {
    window.globalEmitter = new EventEmitter();
  }

  const router = useRouter();

  useRedirectFrom(props.redirectFrom ?? null);
  useIsSharedUser(false); // this page can't be routed for '/share'
  useIsSearchPage(false);

  // Initialize Jotai atoms with initial data - must be called unconditionally
  const pageData = isInitialProps(props) ? props.pageWithMeta?.data : undefined;
  useHydratePageAtoms(pageData);

  const [currentPage] = useCurrentPageData();
  const [pageId, setCurrentPageId] = useCurrentPageId();
  const [currentPagePath] = useCurrentPagePath();
  const [isNotFound] = usePageNotFound();
  const [rendererConfig] = useRendererConfig();
  const [disableLinkSharing] = useDisableLinkSharing();

  const { fetchCurrentPage } = useFetchCurrentPage();
  const { trigger: mutateCurrentPageYjsDataFromApi } = useSWRMUTxCurrentPageYjsData();

  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();

  useSetupGlobalSocket();
  useSetupGlobalSocketForPage(pageId);

  // Handle same-route navigation: fetch page data when needed
  useEffect(() => {
    // Skip if we have initial props with complete data
    if (isInitialProps(props) && !props.skipSSR) {
      return;
    }

    // For same-route or when skipSSR is true, fetch page data client-side
    if (pageId != null) {
      const mutatePageData = async() => {
        setCurrentPageId(pageId);
        const pageData = await fetchCurrentPage();
        mutateEditingMarkdown(pageData?.revision?.body);
      };

      mutatePageData();
    }
  }, [pageId, fetchCurrentPage, mutateEditingMarkdown, props, setCurrentPageId]);

  // Load current yjs data
  useEffect(() => {
    if (pageId != null && currentPage?.revision?._id != null && !isNotFound) {
      mutateCurrentPageYjsDataFromApi();
    }
  }, [currentPage, mutateCurrentPageYjsDataFromApi, isNotFound, currentPage?.revision?._id, pageId]);

  // sync pathname by Shallow Routing https://nextjs.org/docs/routing/shallow-routing
  useEffect(() => {
    const decodedURI = decodeURI(window.location.pathname);
    if (isClient() && decodedURI !== props.currentPathname) {
      const { search, hash } = window.location;
      router.replace(`${props.currentPathname}${search}${hash}`, undefined, { shallow: true });
    }
  }, [props.currentPathname, router]);

  // initialize mutateEditingMarkdown only once per page
  // need to include useCurrentPathname not useCurrentPagePath
  useEffect(() => {
    if (props.currentPathname != null) {
      mutateEditingMarkdown(currentPage?.revision?.body);
    }
  }, [mutateEditingMarkdown, currentPage?.revision?.body, props.currentPathname]);

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
  const sidebarConfig = isInitialProps(props) ? props.sidebarConfig : undefined;
  const userUISettings = isInitialProps(props) ? props.userUISettings : undefined;
  useHydrateSidebarAtoms(sidebarConfig, userUISettings);

  return <BasicLayoutWithEditor>{children}</BasicLayoutWithEditor>;
};

let drawioUri = '';
Page.getLayout = function getLayout(page: React.ReactElement<Props>) {
  if (isInitialProps(page.props)) {
    drawioUri = page.props.rendererConfig.drawioUri;
  }

  return (
    <>
      <GrowiPluginsActivator />
      <DrawioViewerScript drawioUri={drawioUri} />

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
