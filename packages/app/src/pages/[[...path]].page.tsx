import React, { useEffect } from 'react';

import { isClient, pagePathUtils, pathUtils } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';

// import { PageAlerts } from '~/components/PageAlert/PageAlerts';
// import { PageComments } from '~/components/PageComment/PageComments';
// import { useTranslation } from '~/i18n';
import { isPopulated } from '~/interfaces/common';
import { CrowiRequest } from '~/interfaces/crowi-request';
// import { renderScriptTagByName, renderHighlightJsStyleTag } from '~/service/cdn-resources-loader';
// import { useIndentSize } from '~/stores/editor';
// import { useRendererSettings } from '~/stores/renderer';
// import { EditorMode, useEditorMode, useIsMobile } from '~/stores/ui';
import { IPageWithMeta } from '~/interfaces/page';
import { ISidebarConfig } from '~/interfaces/sidebar-config';
import { PageModel, PageDocument } from '~/server/models/page';
import { serializeUserSecurely } from '~/server/models/serializers/user-serializer';
import UserUISettings, { UserUISettingsDocument } from '~/server/models/user-ui-settings';
import { useSWRxCurrentPage, useSWRxPageInfo } from '~/stores/page';
import {
  usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser, useSidebarCollapsed, useCurrentSidebarContents, useCurrentProductNavWidth,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';

// import { isUserPage, isTrashPage, isSharedPage } from '~/utils/path-utils';

// import GrowiSubNavigation from '../client/js/components/Navbar/GrowiSubNavigation';
// import GrowiSubNavigationSwitcher from '../client/js/components/Navbar/GrowiSubNavigationSwitcher';
import { BasicLayout } from '../components/BasicLayout';
import DisplaySwitcher from '../components/Page/DisplaySwitcher';

// import { serializeUserSecurely } from '../server/models/serializers/user-serializer';
// import PageStatusAlert from '../client/js/components/PageStatusAlert';


import {
  useCurrentUser, useCurrentPagePath,
  useOwnerOfCurrentPage,
  useIsForbidden, useIsNotFound, useIsTrashPage, useShared, useShareLinkId, useIsSharedUser, useIsAbleToDeleteCompletely,
  useAppTitle, useSiteUrl, useConfidential, useIsEnabledStaleNotification,
  useIsSearchServiceConfigured, useIsSearchServiceReachable, useIsMailerSetup,
  useIsAclEnabled, useHasSlackConfig, useDrawioUri, useHackmdUri, useMathJax,
  useNoCdn, useEditorConfig, useCsrfToken, useIsSearchScopeChildrenAsDefault, useCurrentPageId, useCurrentPathname, useIsSlackConfigured,
} from '../stores/context';

import { CommonProps, getServerSideCommonProps, useCustomTitle } from './commons';
// import { useCurrentPageSWR } from '../stores/page';


const logger = loggerFactory('growi:pages:all');
const { isPermalink: _isPermalink, isUsersHomePage, isTrashPage: _isTrashPage } = pagePathUtils;
const { removeHeadingSlash } = pathUtils;

type Props = CommonProps & {
  currentUser: string,

  pageWithMetaStr: string,
  // pageUser?: any,
  // redirectTo?: string;
  // redirectFrom?: string;

  // shareLinkId?: string;

  isForbidden: boolean,
  isNotFound: boolean,
  // isAbleToDeleteCompletely: boolean,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,

  isSlackConfigured: boolean,
  // isMailerSetup: boolean,
  isAclEnabled: boolean,
  // hasSlackConfig: boolean,
  // drawioUri: string,
  // hackmdUri: string,
  // mathJax: string,
  // noCdn: string,
  // highlightJsStyle: string,
  // isAllReplyShown: boolean,
  // isContainerFluid: boolean,
  // editorConfig: any,
  // isEnabledStaleNotification: boolean,
  // isEnabledLinebreaks: boolean,
  // isEnabledLinebreaksInComments: boolean,
  // adminPreferredIndentSize: number,
  // isIndentSizeForced: boolean,

  // UI
  userUISettings: UserUISettingsDocument | null
  // Sidebar
  sidebarConfig: ISidebarConfig,
};

const GrowiPage: NextPage<Props> = (props: Props) => {
  // const { t } = useTranslation();
  const router = useRouter();

  const UnsavedAlertDialog = dynamic(() => import('./UnsavedAlertDialog'), { ssr: false });

  const { data: currentUser } = useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);

  // commons
  useAppTitle(props.appTitle);
  useSiteUrl(props.siteUrl);
  // useEditorConfig(props.editorConfig);
  useConfidential(props.confidential);
  useCsrfToken(props.csrfToken);

  // UserUISettings
  usePreferDrawerModeByUser(props.userUISettings?.preferDrawerModeByUser ?? props.sidebarConfig.isSidebarDrawerMode);
  usePreferDrawerModeOnEditByUser(props.userUISettings?.preferDrawerModeOnEditByUser);
  useSidebarCollapsed(props.userUISettings?.isSidebarCollapsed ?? props.sidebarConfig.isSidebarClosedAtDockMode);
  useCurrentSidebarContents(props.userUISettings?.currentSidebarContents);
  useCurrentProductNavWidth(props.userUISettings?.currentProductNavWidth);

  // page
  useCurrentPagePath(props.currentPathname);
  // useOwnerOfCurrentPage(props.pageUser != null ? JSON.parse(props.pageUser) : null);
  useIsForbidden(props.isForbidden);
  useIsNotFound(props.isNotFound);
  // useIsTrashPage(_isTrashPage(props.currentPagePath));
  // useShared();
  // useShareLinkId(props.shareLinkId);
  // useIsAbleToDeleteCompletely(props.isAbleToDeleteCompletely);
  useIsSharedUser(false); // this page cann't be routed for '/share'
  // useIsEnabledStaleNotification(props.isEnabledStaleNotification);

  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  useIsSlackConfigured(props.isSlackConfigured);
  // useIsMailerSetup(props.isMailerSetup);
  useIsAclEnabled(props.isAclEnabled);
  // useHasSlackConfig(props.hasSlackConfig);
  // useDrawioUri(props.drawioUri);
  // useHackmdUri(props.hackmdUri);
  // useMathJax(props.mathJax);
  // useNoCdn(props.noCdn);
  // useIndentSize(props.adminPreferredIndentSize);

  // useRendererSettings({
  //   isEnabledLinebreaks: props.isEnabledLinebreaks,
  //   isEnabledLinebreaksInComments: props.isEnabledLinebreaksInComments,
  //   adminPreferredIndentSize: props.adminPreferredIndentSize,
  //   isIndentSizeForced: props.isIndentSizeForced,
  // });

  // const { data: editorMode } = useEditorMode();

  let pageWithMeta: IPageWithMeta | undefined;
  if (props.pageWithMetaStr != null) {
    pageWithMeta = JSON.parse(props.pageWithMetaStr) as IPageWithMeta;
  }
  useCurrentPageId(pageWithMeta?.data._id);
  useSWRxCurrentPage(undefined, pageWithMeta?.data); // store initial data
  useSWRxPageInfo(pageWithMeta?.data._id, undefined, pageWithMeta?.meta); // store initial data
  useCurrentPagePath(pageWithMeta?.data.path);
  useCurrentPathname(props.currentPathname);

  // sync pathname by Shallow Routing https://nextjs.org/docs/routing/shallow-routing
  useEffect(() => {
    if (isClient() && window.location.pathname !== props.currentPathname) {
      router.replace(props.currentPathname, undefined, { shallow: true });
    }
  }, [props.currentPathname, router]);

  const classNames: string[] = [];
  // switch (editorMode) {
  //   case EditorMode.Editor:
  //     classNames.push('on-edit', 'builtin-editor');
  //     break;
  //   case EditorMode.HackMD:
  //     classNames.push('on-edit', 'hackmd');
  //     break;
  // }
  // if (props.isContainerFluid) {
  //   classNames.push('growi-layout-fluid');
  // }
  // if (page == null) {
  //   classNames.push('not-found-page');
  // }

  return (
    <>
      <Head>
        {/*
        {renderScriptTagByName('drawio-viewer')}
        {renderScriptTagByName('mathjax')}
        {renderScriptTagByName('highlight-addons')}
        {renderHighlightJsStyleTag(props.highlightJsStyle)}
        */}
      </Head>
      {/* <BasicLayout title={useCustomTitle(props, t('GROWI'))} className={classNames.join(' ')}> */}
      <BasicLayout title={useCustomTitle(props, 'GROWI')} className={classNames.join(' ')}>
        <header className="py-0">
          {/* <GrowiSubNavigation /> */}
          GrowiSubNavigation
        </header>
        <div className="d-edit-none">
          {/* <GrowiSubNavigationSwitcher /> */}
          GrowiSubNavigationSwitcher
        </div>

        <div id="grw-subnav-sticky-trigger" className="sticky-top"></div>
        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>

        <div id="main" className={`main ${isUsersHomePage(props.currentPathname) && 'user-page'}`}>

          <div className="row">
            <div className="col grw-page-content-container">
              <div id="content-main" className="content-main grw-container-convertible">
                {/* <PageAlerts /> */}
                PageAlerts<br />
                <DisplaySwitcher />
                <div id="page-editor-navbar-bottom-container" className="d-none d-edit-block"></div>
                {/* <PageStatusAlert /> */}
                PageStatusAlert
              </div>
            </div>

            {/* <div className="col-xl-2 col-lg-3 d-none d-lg-block revision-toc-container">
              <div id="revision-toc" className="revision-toc mt-3 sps sps--abv" data-sps-offset="123">
                <div id="revision-toc-content" className="revision-toc-content"></div>
              </div>
            </div> */}
          </div>

        </div>
        <footer>
          {/* <PageComments /> */}
          PageComments
        </footer>

        <UnsavedAlertDialog />

      </BasicLayout>
    </>
  );
};


function getPageIdFromPathname(currentPathname: string): string | null {
  return _isPermalink(currentPathname) ? removeHeadingSlash(currentPathname) : null;
}

async function getPageData(context: GetServerSidePropsContext, props: Props): Promise<IPageWithMeta|null> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { revisionId } = req.query;
  const { pageService } = crowi;

  const { user } = req;

  const { currentPathname } = props;
  const pageId = getPageIdFromPathname(currentPathname);

  const result: IPageWithMeta = await pageService.findPageAndMetaDataByViewer(pageId, currentPathname, user, true); // includeEmpty = true, isSharedPage = false
  const page = result?.data as unknown as PageDocument;

  // populate
  if (page != null) {
    page.initLatestRevisionField(revisionId);
    await page.populateDataToShowRevision();
  }

  return result;
}

async function injectRoutingInformation(context: GetServerSidePropsContext, props: Props, pageWithMeta: IPageWithMeta|null): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const Page = crowi.model('Page');

  const { currentPathname } = props;
  const pageId = getPageIdFromPathname(currentPathname);
  const isPermalink = _isPermalink(currentPathname);

  const page = pageWithMeta?.data;

  if (page == null) {
    props.isNotFound = true;

    // check the page is forbidden or just does not exist.
    const count = isPermalink ? await Page.count({ _id: pageId }) : await Page.count({ path: currentPathname });
    props.isForbidden = count > 0;
  }

  if (page != null) {
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

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, searchService, configManager, aclService, slackNotificationService, mailService,
  } = crowi;

  const { user } = req;

  const result = await getServerSideCommonProps(context);
  const userUISettings = user == null ? null : await UserUISettings.findOne({ user: user._id }).exec();

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;
  const pageWithMeta = await getPageData(context, props);

  props.pageWithMetaStr = JSON.stringify(pageWithMeta);

  injectRoutingInformation(context, props, pageWithMeta);

  if (user != null) {
    props.currentUser = JSON.stringify(user);
  }

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');

  props.isSlackConfigured = crowi.slackIntegrationService.isSlackConfigured;
  // props.isMailerSetup = mailService.isMailerSetup;
  props.isAclEnabled = aclService.isAclEnabled();
  // props.hasSlackConfig = slackNotificationService.hasSlackConfig();
  // props.drawioUri = configManager.getConfig('crowi', 'app:drawioUri');
  // props.hackmdUri = configManager.getConfig('crowi', 'app:hackmdUri');
  // props.mathJax = configManager.getConfig('crowi', 'app:mathJax');
  // props.noCdn = configManager.getConfig('crowi', 'app:noCdn');
  // props.highlightJsStyle = configManager.getConfig('crowi', 'customize:highlightJsStyle');
  // props.isAllReplyShown = configManager.getConfig('crowi', 'customize:isAllReplyShown');
  // props.isContainerFluid = configManager.getConfig('crowi', 'customize:isContainerFluid');
  // props.isEnabledStaleNotification = configManager.getConfig('crowi', 'customize:isEnabledStaleNotification');
  // props.isEnabledLinebreaks = configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks');
  // props.isEnabledLinebreaksInComments = configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments');
  // props.editorConfig = {
  //   upload: {
  //     image: crowi.fileUploadService.getIsUploadable(),
  //     file: crowi.fileUploadService.getFileUploadEnabled(),
  //   },
  // };
  // props.adminPreferredIndentSize = configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize');
  // props.isIndentSizeForced = configManager.getConfig('markdown', 'markdown:isIndentSizeForced');

  // UI
  props.userUISettings = JSON.parse(JSON.stringify(userUISettings));
  props.sidebarConfig = {
    isSidebarDrawerMode: configManager.getConfig('crowi', 'customize:isSidebarDrawerMode'),
    isSidebarClosedAtDockMode: configManager.getConfig('crowi', 'customize:isSidebarClosedAtDockMode'),
  };
  return {
    props,
  };
};

export default GrowiPage;
