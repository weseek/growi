import type { ReactNode, JSX } from 'react';
import React, { useEffect } from 'react';

import EventEmitter from 'events';

import { isIPageInfo } from '@growi/core';
import type {
  IDataWithMeta, IPageInfo, IPagePopulatedToShowRevision,
} from '@growi/core';
import {
  isClient, pagePathUtils, pathUtils,
} from '@growi/core/dist/utils';
import ExtensibleCustomError from 'extensible-custom-error';
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
import type { CrowiRequest } from '~/interfaces/crowi-request';
import { RegistrationMode } from '~/interfaces/registration-mode';
import type { RendererConfig } from '~/interfaces/services/renderer';
import type { ISidebarConfig } from '~/interfaces/sidebar-config';
import type { PageModel, PageDocument } from '~/server/models/page';
import type { PageRedirectModel } from '~/server/models/page-redirect';
import { useEditorModeClassName } from '~/services/layout/use-editor-mode-class-name';
import { useHydrateSidebarAtoms } from '~/states/hydrate/sidebar';
import {
  useCurrentPageData, useFetchCurrentPage, useCurrentPageId, useCurrentPagePath, usePageNotFound,
} from '~/states/page';
import { useHydratePageAtoms } from '~/states/page/hydrate';
import { ServerConfigurationInitialProps, useHydrateServerConfigurationAtoms } from '~/states/server-configurations/hydrate';
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
import { useCurrentPageYjsData, useSWRMUTxCurrentPageYjsData } from '~/stores/yjs';
import loggerFactory from '~/utils/logger';

import type { NextPageWithLayout } from './_app.page';
import {
  CommonEachProps, CommonInitialProps, getServerSideCommonInitialProps,
} from './utils/commons';

import { NextjsRoutingType, detectNextjsRoutingType } from './utils/nextjs-routing-utils';
import type { UserUISettingsProps } from './utils/user-ui-settings';
import { PageTitleCustomizationProps, generateCustomTitleForPage, getServerSidePageTitleCustomizationProps } from './utils/page-title-customization';
import { SSRProps, getServerSideSSRProps } from './utils/ssr';
import { addActivity } from './utils/activity';
import { SupportedAction, SupportedActionType } from '~/interfaces/activity';


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


const logger = loggerFactory('growi:pages:all');

const {
  isPermalink: _isPermalink, isCreatablePage,
} = pagePathUtils;
const { removeHeadingSlash } = pathUtils;

type IPageToShowRevisionWithMeta = IDataWithMeta<IPagePopulatedToShowRevision & PageDocument, IPageInfo>;
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

type InitialProps = CommonInitialProps & SSRProps & UserUISettingsProps & {
  pageWithMeta: IPageToShowRevisionWithMeta | null,

  sidebarConfig: ISidebarConfig,
  rendererConfig: RendererConfig,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  elasticsearchMaxBodyLengthToIndex: number,
  isEnabledMarp: boolean,

  isRomUserAllowedToComment: boolean,

  isSlackConfigured: boolean,
  isAclEnabled: boolean,
  drawioUri: string | null,
  isAllReplyShown: boolean,
  showPageSideAuthors: boolean,

  isContainerFluid: boolean,
  isUploadEnabled: boolean,
  isUploadAllFileAllowed: boolean,
  isBulkExportPagesEnabled: boolean,
  isPdfBulkExportEnabled: boolean,
  isEnabledStaleNotification: boolean,
  isEnabledAttachTitleHeader: boolean,
  isUsersHomepageDeletionEnabled: boolean,
  isLocalAccountRegistrationEnabled: boolean,

  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
  disableLinkSharing: boolean,

  aiEnabled: boolean,
  limitLearnablePageCountPerAssistant: number,
}

type SameRouteEachProps = CommonEachProps & PageTitleCustomizationProps & {
  redirectFrom?: string;

  isIdenticalPathPage?: boolean,
  isForbidden: boolean,
  isNotCreatable: boolean,

  templateTagData?: string[],
  templateBodyData?: string,
}

type Props = SameRouteEachProps | (InitialProps & SameRouteEachProps);

const isInitialProps = (props: Props): props is (InitialProps & SameRouteEachProps) => {
  return props.nextjsRoutingPage === NextjsRoutingType.INITIAL;
};

const Page: NextPageWithLayout<Props> = (props: Props) => {
  // register global EventEmitter
  if (isClient() && window.globalEmitter == null) {
    window.globalEmitter = new EventEmitter();
  }

  const router = useRouter();

  // useOwnerOfCurrentPage(props.pageUser != null ? JSON.parse(props.pageUser) : null);
  useRedirectFrom(props.redirectFrom ?? null);
  useIsSharedUser(false); // this page cann't be routed for '/share'
  useIsSearchPage(false);

  // Initialize server configuration atoms with props data
  if (isInitialProps(props)) {
    // Initialize Jotai atoms with initial data
    useHydratePageAtoms(props.pageWithMeta?.data);
    useHydrateServerConfigurationAtoms(props);
  }

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

  // Store initial data (When revisionBody is not SSR)
  useEffect(() => {
    if (isInitialProps(props) && !props.skipSSR) {
      return;
    }

    if (pageId != null && currentPage?.revision?._id != null && !isNotFound) {
      const mutatePageData = async() => {
        setCurrentPageId(pageId);
        const pageData = await fetchCurrentPage();
        mutateEditingMarkdown(pageData?.revision?.body);
      };

      // If skipSSR is true, use the API to retrieve page data.
      // Because pageWIthMeta does not contain revision.body
      mutatePageData();
    }
  }, [pageId, currentPage?.revision?._id, isNotFound]);

  // Load current yjs data
  useEffect(() => {
    if (pageId != null && currentPage?.revision?._id != null && !isNotFound) {
      mutateCurrentPageYjsDataFromApi();
    }
  }, [currentPage, mutateCurrentPageYjsDataFromApi, isNotFound, currentPage?.revision?._id]);

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

  // useEffect(() => {
  //   mutateCurrentPageYjsData(props.yjsData);
  // }, [mutateCurrentPageYjsData, props.yjsData]);

  // If the data on the page changes without router.push, pageWithMeta remains old because getServerSideProps() is not executed
  // So preferentially take page data from useSWRxCurrentPage
  // const pagePath = currentPage?.path ?? pageWithMeta?.data.path ?? props.currentPathname;
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
  if (isInitialProps(props)) {
    // Hydrate sidebar atoms with server-side data
    useHydrateSidebarAtoms(props.sidebarConfig, props.userUISettings);
  }
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


function getPageIdFromPathname(currentPathname: string): string | null {
  return _isPermalink(currentPathname) ? removeHeadingSlash(currentPathname) : null;
}

class MultiplePagesHitsError extends ExtensibleCustomError {

  pagePath: string;

  constructor(pagePath: string) {
    super(`MultiplePagesHitsError occured by '${pagePath}'`);
    this.pagePath = pagePath;
  }

}

async function injectPageData(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const { model: mongooseModel } = await import('mongoose');

  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { revisionId } = req.query;

  const Page = crowi.model('Page') as PageModel;
  const PageRedirect = mongooseModel('PageRedirect') as PageRedirectModel;
  const { pageService, configManager } = crowi;

  let currentPathname = props.currentPathname;

  const pageId = getPageIdFromPathname(currentPathname);
  const isPermalink = _isPermalink(currentPathname);

  const { user } = req;

  if (!isPermalink) {
    // check redirects
    const chains = await PageRedirect.retrievePageRedirectEndpoints(currentPathname);
    if (chains != null) {
      // overwrite currentPathname
      currentPathname = chains.end.toPath;
      props.currentPathname = currentPathname;
      // set redirectFrom
      props.redirectFrom = chains.start.fromPath;
    }

    // check whether the specified page path hits to multiple pages
    const count = await Page.countByPathAndViewer(currentPathname, user, null, true);
    if (count > 1) {
      throw new MultiplePagesHitsError(currentPathname);
    }
  }

  const pageWithMeta = await pageService.findPageAndMetaDataByViewer(pageId, currentPathname, user, true); // includeEmpty = true, isSharedPage = false
  const { data: page, meta } = pageWithMeta ?? {};

  // add user to seen users
  if (page != null && user != null) {
    await page.seen(user);
  }

  props.pageWithMeta = null;

  // populate & check if the revision is latest
  if (page != null) {
    page.initLatestRevisionField(revisionId);
    props.isLatestRevision = page.isLatestRevision();
    const ssrMaxRevisionBodyLength = configManager.getConfig('app:ssrMaxRevisionBodyLength');
    props.skipSSR = await skipSSR(page, ssrMaxRevisionBodyLength);
    const populatedPage = await page.populateDataToShowRevision(props.skipSSR); // shouldExcludeBody = skipSSR

    props.pageWithMeta = {
      data: populatedPage,
      meta,
    };
  }
}

async function injectRoutingInformation(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const Page = crowi.model('Page') as PageModel;

  const { currentPathname } = props;
  const pageId = getPageIdFromPathname(currentPathname);
  const isPermalink = _isPermalink(currentPathname);

  const page = props.pageWithMeta?.data;

  if (props.isIdenticalPathPage) {
    props.isNotCreatable = true;
  }
  else if (page == null) {
    props.isNotFound = true;
    props.isNotCreatable = !isCreatablePage(currentPathname);
    // check the page is forbidden or just does not exist.
    const count = isPermalink ? await Page.count({ _id: pageId }) : await Page.count({ path: currentPathname });
    props.isForbidden = count > 0;
  }
  else {
    props.isNotFound = page.isEmpty;
    props.isNotCreatable = false;
    props.isForbidden = false;
    // /62a88db47fed8b2d94f30000 ==> /path/to/page
    if (isPermalink && page.isEmpty) {
      props.currentPathname = page.path;
    }

    // /path/to/page ==> /62a88db47fed8b2d94f30000
    if (!isPermalink && !page.isEmpty) {
      const isToppage = pagePathUtils.isTopPage(props.currentPathname);
      if (!isToppage) {
        props.currentPathname = `/${page._id}`;
      }
    }

    if (!props.skipSSR) {
      props.yjsData = await crowi.pageService.getYjsData(page._id.toString());
    }
  }
}

const getServerSideConfigurationProps: GetServerSideProps<ServerConfigurationInitialProps> = async (context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    configManager, searchService, aclService, fileUploadService,
    slackIntegrationService, passportService,
  } = crowi;

  return {
    props: {
      aiEnabled: configManager.getConfig('app:aiEnabled'),
      limitLearnablePageCountPerAssistant: configManager.getConfig('openai:limitLearnablePageCountPerAssistant'),
      isUsersHomepageDeletionEnabled: configManager.getConfig('security:user-homepage-deletion:isEnabled'),
      isSearchServiceConfigured: searchService.isConfigured,
      isSearchServiceReachable: searchService.isReachable,
      isSearchScopeChildrenAsDefault: configManager.getConfig('customize:isSearchScopeChildrenAsDefault'),
      elasticsearchMaxBodyLengthToIndex: configManager.getConfig('app:elasticsearchMaxBodyLengthToIndex'),

      isRomUserAllowedToComment: configManager.getConfig('security:isRomUserAllowedToComment'),

      isSlackConfigured: slackIntegrationService.isSlackConfigured,
      isAclEnabled: aclService.isAclEnabled(),
      drawioUri: configManager.getConfig('app:drawioUri'),
      isAllReplyShown: configManager.getConfig('customize:isAllReplyShown'),
      showPageSideAuthors: configManager.getConfig('customize:showPageSideAuthors'),
      isContainerFluid: configManager.getConfig('customize:isContainerFluid'),
      isEnabledStaleNotification: configManager.getConfig('customize:isEnabledStaleNotification'),
      disableLinkSharing: configManager.getConfig('security:disableLinkSharing'),
      isUploadAllFileAllowed: fileUploadService.getFileUploadEnabled(),
      isUploadEnabled: fileUploadService.getIsUploadable(),

      // TODO: remove growiCloudUri condition when bulk export can be relased for GROWI.cloud (https://redmine.weseek.co.jp/issues/163220)
      isBulkExportPagesEnabled: configManager.getConfig('app:isBulkExportPagesEnabled') && configManager.getConfig('app:growiCloudUri') == null,
      isPdfBulkExportEnabled: configManager.getConfig('app:pageBulkExportPdfConverterUri') != null,
      isLocalAccountRegistrationEnabled: passportService.isLocalStrategySetup
        && configManager.getConfig('security:registrationMode') !== RegistrationMode.CLOSED,

      adminPreferredIndentSize: configManager.getConfig('markdown:adminPreferredIndentSize'),
      isIndentSizeForced: configManager.getConfig('markdown:isIndentSizeForced'),
      isEnabledAttachTitleHeader: configManager.getConfig('customize:isEnabledAttachTitleHeader'),
      sidebarConfig: {
        isSidebarCollapsedMode: configManager.getConfig('customize:isSidebarCollapsedMode'),
        isSidebarClosedAtDockMode: configManager.getConfig('customize:isSidebarClosedAtDockMode'),
      },
      rendererConfig: {
        isEnabledLinebreaks: configManager.getConfig('markdown:isEnabledLinebreaks'),
        isEnabledLinebreaksInComments: configManager.getConfig('markdown:isEnabledLinebreaksInComments'),
        isEnabledMarp: configManager.getConfig('customize:isEnabledMarp'),
        adminPreferredIndentSize: configManager.getConfig('markdown:adminPreferredIndentSize'),
        isIndentSizeForced: configManager.getConfig('markdown:isIndentSizeForced'),

        drawioUri: configManager.getConfig('app:drawioUri'),
        plantumlUri: configManager.getConfig('app:plantumlUri'),

        // XSS Options
        isEnabledXssPrevention: configManager.getConfig('markdown:rehypeSanitize:isEnabledPrevention'),
        sanitizeType: configManager.getConfig('markdown:rehypeSanitize:option'),
        customTagWhitelist: configManager.getConfig('markdown:rehypeSanitize:tagNames'),
        customAttrWhitelist: configManager.getConfig('markdown:rehypeSanitize:attributes') != null
          ? JSON.parse(configManager.getConfig('markdown:rehypeSanitize:attributes'))
          : undefined,
        highlightJsStyleBorder: configManager.getConfig('customize:highlightJsStyleBorder'),
      },
    },
  }
}


const getAction = (props: Props): SupportedActionType => {
  if (props.isNotCreatable) {
    return SupportedAction.ACTION_PAGE_NOT_CREATABLE;
  }
  if (props.isForbidden) {
    return SupportedAction.ACTION_PAGE_FORBIDDEN;
  }
  if (props.isNotFound) {
    return SupportedAction.ACTION_PAGE_NOT_FOUND;
  }
  if (pagePathUtils.isUsersHomepage(props.pageWithMeta?.data.path ?? '')) {
    return SupportedAction.ACTION_PAGE_USER_HOME_VIEW;
  }
  return SupportedAction.ACTION_PAGE_VIEW;
};

const NEXT_JS_ROUTING_PAGE = '[[...path]]';

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest;
  const { user } = req;

  // detect Next.js routing type
  const nextjsRoutingType = detectNextjsRoutingType(context, NEXT_JS_ROUTING_PAGE);

  console.log('=== getServerSideProps ===', { nextjsRoutingType });

  let props: Props;

  if (nextjsRoutingType === NextjsRoutingType.INITIAL) {
    // props will be (InitialProps & SameRouteEachProps)

    // await injectPageData(context, props);
    // await injectRoutingInformation(context, props);
    // await getServerSideCommonInitialProps(context),
    // await getServerSidePageTitleCustomizationProps(context),
    // await getServerSideConfigurationProps(context),
    // await getServerSideSSRProps(context, page, ['translation']),
    // await addActivity(context, getAction(props));
  }
  else {
    // props will be SameRouteEachProps
  }


  /** Deprecated codes (start): */

  // // check for presence
  // // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  // if (!('props' in commonPropsResult) || !('props' in pageTitleCustomizeationPropsResult)) {
  //   throw new Error('invalid getSSP result');
  // }

  // const props: Props = {
  //   ...commonPropsResult.props,
  //   ...pageTitleCustomizeationPropsResult.props,
  //   nextjsRoutingPage: NEXT_JS_ROUTING_PAGE,
  // } as Props;

  // if (props.redirectDestination != null) {
  //   return {
  //     redirect: {
  //       permanent: false,
  //       destination: props.redirectDestination,
  //     },
  //   };
  // }

  // if (user != null) {
  //   props.currentUser = user.toObject();
  // }

  // try {
  //   await injectPageData(context, props);
  // }
  // catch (err) {
  //   if (err instanceof MultiplePagesHitsError) {
  //     props.isIdenticalPathPage = true;
  //   }
  //   else {
  //     throw err;
  //   }
  // }

  // await injectRoutingInformation(context, props);
  // injectServerConfigurations(context, props);
  // await getServerSideSSRProps(context, props, ['translation']);

  // addActivity(context, getAction(props));
  /** Deprecated codes (end): */

  // return {
  //   props,
  // };
};

export default Page;
