import React, { useEffect } from 'react';


import EventEmitter from 'events';

import {
  isClient, isIPageInfoForEntity, pagePathUtils, pathUtils,
} from '@growi/core';
import type {
  IDataWithMeta, IPageInfoForEntity, IPagePopulatedToShowRevision, IUser, IUserHasId,
} from '@growi/core';
import ExtensibleCustomError from 'extensible-custom-error';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import superjson from 'superjson';

import { Comments } from '~/components/Comments';
import { PageAlerts } from '~/components/PageAlert/PageAlerts';
// import { useTranslation } from '~/i18n';
import { CurrentPageContentFooter } from '~/components/PageContentFooter';
import { UsersHomePageFooterProps } from '~/components/UsersHomePageFooter';
import type { CrowiRequest } from '~/interfaces/crowi-request';
// import { renderScriptTagByName, renderHighlightJsStyleTag } from '~/service/cdn-resources-loader';
// import { useRendererSettings } from '~/stores/renderer';
// import { EditorMode, useEditorMode, useIsMobile } from '~/stores/ui';
import type { EditorConfig } from '~/interfaces/editor-settings';
import type { CustomWindow } from '~/interfaces/global';
import type { RendererConfig } from '~/interfaces/services/renderer';
import type { ISidebarConfig } from '~/interfaces/sidebar-config';
import type { IUserUISettings } from '~/interfaces/user-ui-settings';
import type { PageModel, PageDocument } from '~/server/models/page';
import type { PageRedirectModel } from '~/server/models/page-redirect';
import type { UserUISettingsModel } from '~/server/models/user-ui-settings';
import { useSWRxCurrentPage, useSWRxIsGrantNormalized, useSWRxPageInfo } from '~/stores/page';
import { useRedirectFrom } from '~/stores/page-redirect';
import {
  EditorMode,
  useEditorMode, useSelectedGrant,
  usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser, useSidebarCollapsed, useCurrentSidebarContents, useCurrentProductNavWidth,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';

// import { isUserPage, isTrashPage, isSharedPage } from '~/utils/path-utils';

// import GrowiSubNavigation from '../client/js/components/Navbar/GrowiSubNavigation';
// import GrowiSubNavigationSwitcher from '../client/js/components/Navbar/GrowiSubNavigationSwitcher';
import { DescendantsPageListModal } from '../components/DescendantsPageListModal';
import { BasicLayout } from '../components/Layout/BasicLayout';
import GrowiContextualSubNavigation from '../components/Navbar/GrowiContextualSubNavigation';
import DisplaySwitcher from '../components/Page/DisplaySwitcher';
// import { serializeUserSecurely } from '../server/models/serializers/user-serializer';
// import PageStatusAlert from '../client/js/components/PageStatusAlert';
import {
  useCurrentUser, useCurrentPagePath,
  useIsLatestRevision,
  useIsForbidden, useIsNotFound, useIsTrashPage, useIsSharedUser,
  useIsEnabledStaleNotification, useIsIdenticalPath,
  useIsSearchServiceConfigured, useIsSearchServiceReachable, useDisableLinkSharing,
  useDrawioUri, useHackmdUri, useDefaultIndentSize, useIsIndentSizeForced,
  useIsAclEnabled, useIsUserPage, useIsSearchPage,
  useCsrfToken, useIsSearchScopeChildrenAsDefault, useCurrentPageId, useCurrentPathname,
  useIsSlackConfigured, useRendererConfig, useEditingMarkdown,
  useEditorConfig, useIsAllReplyShown, useIsUploadableFile, useIsUploadableImage, useLayoutSetting,
} from '../stores/context';

import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps, useCustomTitle,
} from './utils/commons';
import { calcIsContainerFluid } from './utils/layout';
// import { useCurrentPageSWR } from '../stores/page';


const NotCreatablePage = dynamic(() => import('../components/NotCreatablePage').then(mod => mod.NotCreatablePage), { ssr: false });
const ForbiddenPage = dynamic(() => import('../components/ForbiddenPage'), { ssr: false });
const UnsavedAlertDialog = dynamic(() => import('../components/UnsavedAlertDialog'), { ssr: false });
const GrowiSubNavigationSwitcher = dynamic(() => import('../components/Navbar/GrowiSubNavigationSwitcher'), { ssr: false });
const UsersHomePageFooter = dynamic<UsersHomePageFooterProps>(() => import('../components/UsersHomePageFooter')
  .then(mod => mod.UsersHomePageFooter), { ssr: false });

const logger = loggerFactory('growi:pages:all');

const {
  isPermalink: _isPermalink, isUsersHomePage, isTrashPage: _isTrashPage, isUserPage, isCreatablePage, isTopPage,
} = pagePathUtils;
const { removeHeadingSlash } = pathUtils;

type IPageToShowRevisionWithMeta = IDataWithMeta<IPagePopulatedToShowRevision & PageDocument, IPageInfoForEntity>;
type IPageToShowRevisionWithMetaSerialized = IDataWithMeta<string, string>;

superjson.registerCustom<IPageToShowRevisionWithMeta, IPageToShowRevisionWithMetaSerialized>(
  {
    isApplicable: (v): v is IPageToShowRevisionWithMeta => {
      return v?.data != null
        && v?.data.toObject != null
        && v?.meta != null
        && isIPageInfoForEntity(v.meta);
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


const IdenticalPathPage = (): JSX.Element => {
  const IdenticalPathPage = dynamic(() => import('../components/IdenticalPathPage').then(mod => mod.IdenticalPathPage), { ssr: false });
  return <IdenticalPathPage />;
};

const PutbackPageModal = (): JSX.Element => {
  const PutbackPageModal = dynamic(() => import('../components/PutbackPageModal'), { ssr: false });
  return <PutbackPageModal />;
};

type Props = CommonProps & {
  currentUser: IUser,

  pageWithMeta: IPageToShowRevisionWithMeta | null,
  // pageUser?: any,
  redirectFrom?: string;

  // shareLinkId?: string;
  isLatestRevision?: boolean

  isIdenticalPathPage?: boolean,
  isForbidden: boolean,
  isNotFound: boolean,
  isNotCreatablePage: boolean,
  // isAbleToDeleteCompletely: boolean,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,

  isSlackConfigured: boolean,
  // isMailerSetup: boolean,
  isAclEnabled: boolean,
  // hasSlackConfig: boolean,
  drawioUri: string,
  hackmdUri: string,
  noCdn: string,
  // highlightJsStyle: string,
  isAllReplyShown: boolean,
  isContainerFluid: boolean,
  editorConfig: EditorConfig,
  isEnabledStaleNotification: boolean,
  // isEnabledLinebreaks: boolean,
  // isEnabledLinebreaksInComments: boolean,
  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
  disableLinkSharing: boolean,

  rendererConfig: RendererConfig,

  // UI
  userUISettings?: IUserUISettings
  // Sidebar
  sidebarConfig: ISidebarConfig,
};

const GrowiPage: NextPage<Props> = (props: Props) => {
  // const { t } = useTranslation();
  const router = useRouter();

  const { data: currentUser } = useCurrentUser(props.currentUser ?? null);

  // register global EventEmitter
  if (isClient()) {
    (window as CustomWindow).globalEmitter = new EventEmitter();
  }

  // commons
  useEditorConfig(props.editorConfig);
  useCsrfToken(props.csrfToken);

  // UserUISettings
  usePreferDrawerModeByUser(props.userUISettings?.preferDrawerModeByUser ?? props.sidebarConfig.isSidebarDrawerMode);
  usePreferDrawerModeOnEditByUser(props.userUISettings?.preferDrawerModeOnEditByUser);
  useSidebarCollapsed(props.userUISettings?.isSidebarCollapsed ?? props.sidebarConfig.isSidebarClosedAtDockMode);
  useCurrentSidebarContents(props.userUISettings?.currentSidebarContents);
  useCurrentProductNavWidth(props.userUISettings?.currentProductNavWidth);

  // page
  useIsLatestRevision(props.isLatestRevision);
  // useOwnerOfCurrentPage(props.pageUser != null ? JSON.parse(props.pageUser) : null);
  useIsForbidden(props.isForbidden);
  useIsNotFound(props.isNotFound);
  // useIsNotCreatable(props.IsNotCreatable);
  useRedirectFrom(props.redirectFrom);
  // useShared();
  // useShareLinkId(props.shareLinkId);
  useIsSharedUser(false); // this page cann't be routed for '/share'
  useIsIdenticalPath(false); // TODO: need to initialize from props
  // useIsAbleToDeleteCompletely(props.isAbleToDeleteCompletely);
  useIsEnabledStaleNotification(props.isEnabledStaleNotification);
  useIsSearchPage(false);

  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  useIsSlackConfigured(props.isSlackConfigured);
  // useIsMailerSetup(props.isMailerSetup);
  useIsAclEnabled(props.isAclEnabled);
  // useHasSlackConfig(props.hasSlackConfig);
  useDrawioUri(props.drawioUri);
  useHackmdUri(props.hackmdUri);
  // useNoCdn(props.noCdn);
  useDefaultIndentSize(props.adminPreferredIndentSize);
  useIsIndentSizeForced(props.isIndentSizeForced);
  useDisableLinkSharing(props.disableLinkSharing);
  useRendererConfig(props.rendererConfig);
  // useRendererSettings(props.rendererSettingsStr != null ? JSON.parse(props.rendererSettingsStr) : undefined);
  // useGrowiRendererConfig(props.growiRendererConfigStr != null ? JSON.parse(props.growiRendererConfigStr) : undefined);
  useIsAllReplyShown(props.isAllReplyShown);

  useIsUploadableFile(props.editorConfig.upload.isUploadableFile);
  useIsUploadableImage(props.editorConfig.upload.isUploadableImage);

  const { pageWithMeta, userUISettings } = props;

  const pageId = pageWithMeta?.data._id;
  const pagePath = pageWithMeta?.data.path ?? (!_isPermalink(props.currentPathname) ? props.currentPathname : undefined);

  useCurrentPageId(pageId ?? null);
  useIsUserPage(pagePath != null && isUserPage(pagePath));
  // useIsNotCreatable(props.isForbidden || !isCreatablePage(pagePath)); // TODO: need to include props.isIdentical
  useCurrentPagePath(pagePath);
  useCurrentPathname(props.currentPathname);
  useIsTrashPage(pagePath != null && _isTrashPage(pagePath));

  useSWRxCurrentPage(undefined, pageWithMeta?.data ?? null); // store initial data
  useEditingMarkdown(pageWithMeta?.data.revision?.body ?? '');
  const { data: dataPageInfo } = useSWRxPageInfo(pageId);
  const { data: grantData } = useSWRxIsGrantNormalized(pageId);
  const { mutate: mutateSelectedGrant } = useSelectedGrant();

  const { data: layoutSetting } = useLayoutSetting({ isContainerFluid: props.isContainerFluid });
  const { getClassNamesByEditorMode } = useEditorMode();

  const shouldRenderPutbackPageModal = pageWithMeta != null
    ? _isTrashPage(pageWithMeta.data.path)
    : false;

  // sync grant data
  useEffect(() => {
    mutateSelectedGrant(grantData?.grantData.currentPageGrant);
  }, [grantData?.grantData.currentPageGrant, mutateSelectedGrant]);

  // sync pathname by Shallow Routing https://nextjs.org/docs/routing/shallow-routing
  useEffect(() => {
    const decodedURI = decodeURI(window.location.pathname);
    if (isClient() && decodedURI !== props.currentPathname) {
      router.replace(props.currentPathname, undefined, { shallow: true });
    }
  }, [props.currentPathname, router]);

  const classNames: string[] = [];

  const isSidebar = pagePath === '/Sidebar';
  classNames.push(...getClassNamesByEditorMode(isSidebar));

  const isTopPagePath = isTopPage(pageWithMeta?.data.path ?? '');

  const isContainerFluidEachPage = dataPageInfo == null || !('expandContentWidth' in dataPageInfo)
    ? null
    : dataPageInfo.expandContentWidth;
  const isContainerFluidDefault = props.isContainerFluid;
  const isContainerFluidAdmin = layoutSetting?.isContainerFluid;
  const isContainerFluid = calcIsContainerFluid(isContainerFluidEachPage, isContainerFluidDefault, isContainerFluidAdmin);

  return (
    <>
      <Head>
        {/*
        {renderScriptTagByName('drawio-viewer')}
        {renderScriptTagByName('highlight-addons')}
        {renderHighlightJsStyleTag(props.highlightJsStyle)}
        */}
      </Head>
      <BasicLayout title={useCustomTitle(props, 'GROWI')} className={classNames.join(' ')} expandContainer={isContainerFluid}>
        <div className="h-100 d-flex flex-column justify-content-between">
          <header className="py-0 position-relative">
            <div id="grw-subnav-container">
              <GrowiContextualSubNavigation isLinkSharingDisabled={props.disableLinkSharing} />
            </div>
          </header>
          <div className="d-edit-none">
            <GrowiSubNavigationSwitcher />
          </div>

          <div id="grw-subnav-sticky-trigger" className="sticky-top"></div>
          <div id="grw-fav-sticky-trigger" className="sticky-top"></div>

          <div className="flex-grow-1">
            <div id="main" className={`main ${isUsersHomePage(props.currentPathname) && 'user-page'}`}>
              <div id="content-main" className="content-main grw-container-convertible">
                { props.isIdenticalPathPage && <IdenticalPathPage /> }

                { !props.isIdenticalPathPage && (
                  <>
                    <PageAlerts />
                    { props.isForbidden && <ForbiddenPage /> }
                    { props.isNotCreatablePage && <NotCreatablePage />}
                    { !props.isForbidden && !props.isNotCreatablePage && <DisplaySwitcher />}
                    {/* <DisplaySwitcher /> */}
                    {/* <PageStatusAlert /> */}
                  </>
                ) }

                {/* <div className="col-xl-2 col-lg-3 d-none d-lg-block revision-toc-container">
                  <div id="revision-toc" className="revision-toc mt-3 sps sps--abv" data-sps-offset="123">
                    <div id="revision-toc-content" className="revision-toc-content"></div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
          { !props.isIdenticalPathPage && !props.isNotFound && (
            <footer className="footer d-edit-none">
              { pageWithMeta != null && !isTopPagePath && (<Comments pageId={pageId} revision={pageWithMeta.data.revision} />) }
              { pageWithMeta != null && isUsersHomePage(pageWithMeta.data.path) && (
                <UsersHomePageFooter creatorId={pageWithMeta.data.creator._id}/>
              ) }
              <CurrentPageContentFooter />
            </footer>
          )}

          <UnsavedAlertDialog />
          <DescendantsPageListModal />
          {shouldRenderPutbackPageModal && <PutbackPageModal />}
        </div>
      </BasicLayout>
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
  const { pageService } = crowi;

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

  const pageWithMeta: IPageToShowRevisionWithMeta | null = await pageService.findPageAndMetaDataByViewer(pageId, currentPathname, user, true); // includeEmpty = true, isSharedPage = false
  const page = pageWithMeta?.data as unknown as PageDocument;

  // add user to seen users
  if (page != null && user != null) {
    await page.seen(user);
  }

  // populate & check if the revision is latest
  if (page != null) {
    page.initLatestRevisionField(revisionId);
    await page.populateDataToShowRevision();
    props.isLatestRevision = page.isLatestRevision();
  }

  props.pageWithMeta = pageWithMeta;
}

async function injectUserUISettings(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const { model: mongooseModel } = await import('mongoose');

  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;
  const UserUISettings = mongooseModel('UserUISettings') as UserUISettingsModel;

  const userUISettings = user == null ? null : await UserUISettings.findOne({ user: user._id }).exec();
  if (userUISettings != null) {
    props.userUISettings = userUISettings.toObject();
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
    // TBD
  }
  else if (page == null) {
    props.isNotFound = true;
    props.isNotCreatablePage = !isCreatablePage(currentPathname);
    // check the page is forbidden or just does not exist.
    const count = isPermalink ? await Page.count({ _id: pageId }) : await Page.count({ path: currentPathname });
    props.isForbidden = count > 0;
  }
  else {
    props.isNotFound = page.isEmpty;

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
  }
}

// async function injectPageUserInformation(context: GetServerSidePropsContext, props: Props): Promise<void> {
//   const req: CrowiRequest = context.req as CrowiRequest;
//   const { crowi } = req;
//   const UserModel = crowi.model('User');

//   if (isUserPage(props.currentPagePath)) {
//     const user = await UserModel.findUserByUsername(UserModel.getUsernameByPath(props.currentPagePath));

//     if (user != null) {
//       props.pageUser = JSON.stringify(user.toObject());
//     }
//   }
// }

function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, searchService, configManager, aclService, slackNotificationService, mailService,
  } = crowi;

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');

  props.isSlackConfigured = crowi.slackIntegrationService.isSlackConfigured;
  // props.isMailerSetup = mailService.isMailerSetup;
  props.isAclEnabled = aclService.isAclEnabled();
  // props.hasSlackConfig = slackNotificationService.hasSlackConfig();
  props.drawioUri = configManager.getConfig('crowi', 'app:drawioUri');
  props.hackmdUri = configManager.getConfig('crowi', 'app:hackmdUri');
  props.noCdn = configManager.getConfig('crowi', 'app:noCdn');
  // props.highlightJsStyle = configManager.getConfig('crowi', 'customize:highlightJsStyle');
  props.isAllReplyShown = configManager.getConfig('crowi', 'customize:isAllReplyShown');
  props.isContainerFluid = configManager.getConfig('crowi', 'customize:isContainerFluid');
  props.isEnabledStaleNotification = configManager.getConfig('crowi', 'customize:isEnabledStaleNotification');
  // props.isEnabledLinebreaks = configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks');
  // props.isEnabledLinebreaksInComments = configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments');
  props.disableLinkSharing = configManager.getConfig('crowi', 'security:disableLinkSharing');
  props.editorConfig = {
    upload: {
      isUploadableFile: crowi.fileUploadService.getFileUploadEnabled(),
      isUploadableImage: crowi.fileUploadService.getIsUploadable(),
    },
  };
  props.adminPreferredIndentSize = configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize');
  props.isIndentSizeForced = configManager.getConfig('markdown', 'markdown:isIndentSizeForced');

  props.rendererConfig = {
    isEnabledLinebreaks: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
    isEnabledLinebreaksInComments: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
    adminPreferredIndentSize: configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
    isIndentSizeForced: configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),

    plantumlUri: process.env.PLANTUML_URI ?? null,
    blockdiagUri: process.env.BLOCKDIAG_URI ?? null,

    // XSS Options
    isEnabledXssPrevention: configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention'),
    attrWhiteList: crowi.xssService.getAttrWhiteList(),
    tagWhiteList: crowi.xssService.getTagWhiteList(),
    highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
  };

  props.sidebarConfig = {
    isSidebarDrawerMode: configManager.getConfig('crowi', 'customize:isSidebarDrawerMode'),
    isSidebarClosedAtDockMode: configManager.getConfig('crowi', 'customize:isSidebarClosedAtDockMode'),
  };
}

/**
 * for Server Side Translations
 * @param context
 * @param props
 * @param namespacesRequired
 */
async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;

  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  if (props.redirectDestination != null) {
    return {
      redirect: {
        permanent: false,
        destination: props.redirectDestination,
      },
    };
  }

  if (user != null) {
    props.currentUser = user.toObject();
  }

  try {
    await injectPageData(context, props);
  }
  catch (err) {
    if (err instanceof MultiplePagesHitsError) {
      props.isIdenticalPathPage = true;
    }
    else {
      throw err;
    }
  }

  await injectUserUISettings(context, props);
  await injectRoutingInformation(context, props);
  injectServerConfigurations(context, props);
  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default GrowiPage;
