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
  GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import superjson from 'superjson';

import { useCurrentGrowiLayoutFluidClassName } from '~/client/services/layout';
import { Comments } from '~/components/Comments';
import { MainPane } from '~/components/Layout/MainPane';
import { PageAlerts } from '~/components/PageAlert/PageAlerts';
// import { useTranslation } from '~/i18n';
import { PageContentFooter } from '~/components/PageContentFooter';
import QuestionnaireModalManager from '~/components/Questionnaire/QuestionnaireModalManager';
import { DrawioViewerScript } from '~/components/Script/DrawioViewerScript';
import { UsersHomePageFooterProps } from '~/components/UsersHomePageFooter';
import type { CrowiRequest } from '~/interfaces/crowi-request';
// import { renderScriptTagByName, renderHighlightJsStyleTag } from '~/service/cdn-resources-loader';
// import { useRendererSettings } from '~/stores/renderer';
// import { EditorMode, useEditorMode, useIsMobile } from '~/stores/ui';
import type { EditorConfig } from '~/interfaces/editor-settings';
import { IPageGrantData } from '~/interfaces/page';
import type { RendererConfig } from '~/interfaces/services/renderer';
import type { ISidebarConfig } from '~/interfaces/sidebar-config';
import type { IUserUISettings } from '~/interfaces/user-ui-settings';
import type { PageModel, PageDocument } from '~/server/models/page';
import type { PageRedirectModel } from '~/server/models/page-redirect';
import type { UserUISettingsModel } from '~/server/models/user-ui-settings';
import { useEditingMarkdown } from '~/stores/editor';
import { useHasDraftOnHackmd, usePageIdOnHackmd, useRevisionIdHackmdSynced } from '~/stores/hackmd';
import { useSWRxCurrentPage, useSWRxIsGrantNormalized } from '~/stores/page';
import { useRedirectFrom } from '~/stores/page-redirect';
import { useRemoteRevisionId } from '~/stores/remote-latest-page';
import {
  useSelectedGrant,
  usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser, useSidebarCollapsed, useCurrentSidebarContents, useCurrentProductNavWidth,
} from '~/stores/ui';
import { useSetupGlobalSocket, useSetupGlobalSocketForPage } from '~/stores/websocket';
import loggerFactory from '~/utils/logger';

// import { isUserPage, isTrashPage, isSharedPage } from '~/utils/path-utils';

// import GrowiSubNavigation from '../client/js/components/Navbar/GrowiSubNavigation';
import { DescendantsPageListModal } from '../components/DescendantsPageListModal';
import { BasicLayoutWithEditorMode } from '../components/Layout/BasicLayout';
import GrowiContextualSubNavigationSubstance from '../components/Navbar/GrowiContextualSubNavigation';
import type { GrowiSubNavigationSwitcherProps } from '../components/Navbar/GrowiSubNavigationSwitcher';
import DisplaySwitcher from '../components/Page/DisplaySwitcher';
// import { serializeUserSecurely } from '../server/models/serializers/user-serializer';
// import PageStatusAlert from '../client/js/components/PageStatusAlert';
import type { PageSideContentsProps } from '../components/PageSideContents';
import {
  useCurrentUser,
  useIsLatestRevision,
  useIsForbidden, useIsNotFound, useIsSharedUser,
  useIsEnabledStaleNotification, useIsIdenticalPath,
  useIsSearchServiceConfigured, useIsSearchServiceReachable, useDisableLinkSharing,
  useDrawioUri, useHackmdUri, useDefaultIndentSize, useIsIndentSizeForced,
  useIsAclEnabled, useIsSearchPage, useTemplateTagData, useTemplateBodyData, useIsEnabledAttachTitleHeader,
  useCsrfToken, useIsSearchScopeChildrenAsDefault, useCurrentPageId, useCurrentPathname,
  useIsSlackConfigured, useRendererConfig,
  useEditorConfig, useIsAllReplyShown, useIsUploadableFile, useIsUploadableImage, useIsContainerFluid, useIsNotCreatable,
} from '../stores/context';

import { NextPageWithLayout } from './_app.page';
import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps, generateCustomTitleForPage,
} from './utils/commons';


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}


const NotCreatablePage = dynamic(() => import('../components/NotCreatablePage').then(mod => mod.NotCreatablePage), { ssr: false });
const ForbiddenPage = dynamic(() => import('../components/ForbiddenPage'), { ssr: false });
const UnsavedAlertDialog = dynamic(() => import('../components/UnsavedAlertDialog'), { ssr: false });
const PageSideContents = dynamic<PageSideContentsProps>(() => import('../components/PageSideContents').then(mod => mod.PageSideContents), { ssr: false });
const GrowiSubNavigationSwitcher = dynamic<GrowiSubNavigationSwitcherProps>(() => import('../components/Navbar/GrowiSubNavigationSwitcher')
  .then(mod => mod.GrowiSubNavigationSwitcher), { ssr: false });
const UsersHomePageFooter = dynamic<UsersHomePageFooterProps>(() => import('../components/UsersHomePageFooter')
  .then(mod => mod.UsersHomePageFooter), { ssr: false });
const DrawioModal = dynamic(() => import('../components/PageEditor/DrawioModal').then(mod => mod.DrawioModal), { ssr: false });
const HandsontableModal = dynamic(() => import('../components/PageEditor/HandsontableModal').then(mod => mod.HandsontableModal), { ssr: false });
const PageStatusAlert = dynamic(() => import('../components/PageStatusAlert').then(mod => mod.PageStatusAlert), { ssr: false });

const logger = loggerFactory('growi:pages:all');

const {
  isPermalink: _isPermalink, isUsersHomePage, isTrashPage: _isTrashPage, isCreatablePage, isTopPage,
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

// GrowiContextualSubNavigation for NOT shared page
type GrowiContextualSubNavigationProps = {
  isLinkSharingDisabled: boolean,
}

const GrowiContextualSubNavigation = (props: GrowiContextualSubNavigationProps): JSX.Element => {
  const { isLinkSharingDisabled } = props;
  const { data: currentPage } = useSWRxCurrentPage();
  return (
    <div data-testid="grw-contextual-sub-nav">
      <GrowiContextualSubNavigationSubstance currentPage={currentPage} isLinkSharingDisabled={isLinkSharingDisabled}/>
    </div>
  );
};

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
  isLatestRevision?: boolean,

  isIdenticalPathPage?: boolean,
  isForbidden: boolean,
  isNotFound: boolean,
  isNotCreatable: boolean,
  // isAbleToDeleteCompletely: boolean,

  templateTagData?: string[],
  templateBodyData?: string,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,

  isSlackConfigured: boolean,
  // isMailerSetup: boolean,
  isAclEnabled: boolean,
  // hasSlackConfig: boolean,
  drawioUri: string | null,
  hackmdUri: string,
  noCdn: string,
  // highlightJsStyle: string,
  isAllReplyShown: boolean,
  isContainerFluid: boolean,
  editorConfig: EditorConfig,
  isEnabledStaleNotification: boolean,
  isEnabledAttachTitleHeader: boolean,
  // isEnabledLinebreaks: boolean,
  // isEnabledLinebreaksInComments: boolean,
  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
  disableLinkSharing: boolean,

  grantData?: IPageGrantData,

  rendererConfig: RendererConfig,

  // UI
  userUISettings?: IUserUISettings
  // Sidebar
  sidebarConfig: ISidebarConfig,

  growiQuestionnaireServerOrigin: string,
};

const Page: NextPageWithLayout<Props> = (props: Props) => {
  // const { t } = useTranslation();
  const router = useRouter();

  const { data: currentUser } = useCurrentUser(props.currentUser ?? null);

  // register global EventEmitter
  if (isClient() && window.globalEmitter == null) {
    window.globalEmitter = new EventEmitter();
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
  useIsContainerFluid(props.isContainerFluid);
  // useOwnerOfCurrentPage(props.pageUser != null ? JSON.parse(props.pageUser) : null);
  useIsForbidden(props.isForbidden);
  useIsNotFound(props.isNotFound);
  useIsNotCreatable(props.isNotCreatable);
  useRedirectFrom(props.redirectFrom ?? null);
  useIsSharedUser(false); // this page cann't be routed for '/share'
  useIsIdenticalPath(props.isIdenticalPathPage ?? false);
  useIsEnabledStaleNotification(props.isEnabledStaleNotification);
  useIsSearchPage(false);

  useTemplateTagData(props.templateTagData);
  useTemplateBodyData(props.templateBodyData);

  useIsEnabledAttachTitleHeader(props.isEnabledAttachTitleHeader);
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
  useRevisionIdHackmdSynced(pageWithMeta?.data.revisionHackmdSynced);
  useRemoteRevisionId(pageWithMeta?.data.revision?._id);
  usePageIdOnHackmd(pageWithMeta?.data.pageIdOnHackmd);
  useHasDraftOnHackmd(pageWithMeta?.data.hasDraftOnHackmd ?? false);
  useCurrentPathname(props.currentPathname);

  useSWRxCurrentPage(pageWithMeta?.data ?? null); // store initial data

  useEditingMarkdown(pageWithMeta?.data.revision?.body);

  const { data: grantData } = useSWRxIsGrantNormalized(pageId);
  const { mutate: mutateSelectedGrant } = useSelectedGrant();

  useSetupGlobalSocket();
  useSetupGlobalSocketForPage(pageId);

  const growiLayoutFluidClass = useCurrentGrowiLayoutFluidClassName();

  const shouldRenderPutbackPageModal = pageWithMeta != null
    ? _isTrashPage(pageWithMeta.data.path)
    : false;

  // sync grant data
  useEffect(() => {
    const grantDataToApply = props.grantData ? props.grantData : grantData?.grantData.currentPageGrant;
    mutateSelectedGrant(grantDataToApply);
  }, [grantData?.grantData.currentPageGrant, mutateSelectedGrant, props.grantData]);

  // sync pathname by Shallow Routing https://nextjs.org/docs/routing/shallow-routing
  useEffect(() => {
    const decodedURI = decodeURI(window.location.pathname);
    if (isClient() && decodedURI !== props.currentPathname) {
      const { search, hash } = window.location;
      router.replace(`${props.currentPathname}${search}${hash}`, undefined, { shallow: true });
    }
  }, [props.currentPathname, router]);

  const isTopPagePath = isTopPage(pageWithMeta?.data.path ?? '');

  const title = generateCustomTitleForPage(props, pagePath ?? '');


  const sideContents = !props.isNotFound && !props.isNotCreatable
    ? (
      <PageSideContents page={pageWithMeta?.data} />
    )
    : <></>;

  const footerContents = !props.isIdenticalPathPage && !props.isNotFound && pageWithMeta != null
    ? (
      <>
        { pagePath != null && !isTopPagePath && (
          <Comments pageId={pageId} pagePath={pagePath} revision={pageWithMeta.data.revision} />
        ) }
        { isUsersHomePage(pageWithMeta.data.path) && (
          <UsersHomePageFooter creatorId={pageWithMeta.data.creator._id}/>
        ) }
        <PageContentFooter page={pageWithMeta.data} />
      </>
    )
    : <></>;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className={`dynamic-layout-root ${growiLayoutFluidClass} h-100 d-flex flex-column justify-content-between`}>
        <header className="py-0 position-relative">
          <div id="grw-subnav-container">
            <GrowiContextualSubNavigation isLinkSharingDisabled={props.disableLinkSharing} />
          </div>
        </header>
        <div className="d-edit-none">
          <GrowiSubNavigationSwitcher isLinkSharingDisabled={props.disableLinkSharing} />
        </div>

        <div id="grw-subnav-sticky-trigger" className="sticky-top"></div>
        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>

        <MainPane
          sideContents={sideContents}
          footerContents={footerContents}
        >
          <PageAlerts />
          { props.isIdenticalPathPage && <IdenticalPathPage />}
          { !props.isIdenticalPathPage && (
            <>
              { props.isForbidden && <ForbiddenPage /> }
              { props.isNotCreatable && <NotCreatablePage />}
              { !props.isForbidden && !props.isNotCreatable && <DisplaySwitcher />}
            </>
          ) }
          <PageStatusAlert />
        </MainPane>

        {shouldRenderPutbackPageModal && <PutbackPageModal />}
      </div>
    </>
  );
};

Page.getLayout = function getLayout(page) {
  return (
    <>
      <DrawioViewerScript />

      <BasicLayoutWithEditorMode>
        {page}
      </BasicLayoutWithEditorMode>
      <UnsavedAlertDialog />
      <DescendantsPageListModal />
      <DrawioModal />
      <HandsontableModal />
      <QuestionnaireModalManager />
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

// apply parent page grant fot creating page
async function applyGrantToPage(props: Props, ancestor: any) {
  await ancestor.populate('grantedGroup');
  const grant = {
    grant: ancestor.grant,
  };
  const grantedGroup = ancestor.grantedGroup ? {
    grantedGroup: {
      id: ancestor.grantedGroup.id,
      name: ancestor.grantedGroup.name,
    },
  } : {};
  props.grantData = Object.assign(grant, grantedGroup);
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

  if (page == null && user != null) {
    const templateData = await Page.findTemplate(props.currentPathname);
    if (templateData != null) {
      props.templateTagData = templateData.templateTags as string[];
      props.templateBodyData = templateData.templateBody as string;
    }

    // apply pagrent page grant
    const ancestor = await Page.findAncestorByPathAndViewer(currentPathname, user);
    if (ancestor != null) {
      await applyGrantToPage(props, ancestor);
    }
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
  props.disableLinkSharing = configManager.getConfig('crowi', 'security:disableLinkSharing');
  props.editorConfig = {
    upload: {
      isUploadableFile: crowi.fileUploadService.getFileUploadEnabled(),
      isUploadableImage: crowi.fileUploadService.getIsUploadable(),
    },
  };
  props.adminPreferredIndentSize = configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize');
  props.isIndentSizeForced = configManager.getConfig('markdown', 'markdown:isIndentSizeForced');

  props.isEnabledAttachTitleHeader = configManager.getConfig('crowi', 'customize:isEnabledAttachTitleHeader');

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

export default Page;
