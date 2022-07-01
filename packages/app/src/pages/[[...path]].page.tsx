import React, { useEffect } from 'react';

import { pagePathUtils } from '@growi/core';
import { isValidObjectId } from 'mongoose';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { PageAlerts } from '~/components/PageAlert/PageAlerts';
// import { PageComments } from '~/components/PageComment/PageComments';
// import { useTranslation } from '~/i18n';
import { CrowiRequest } from '~/interfaces/crowi-request';
// import { renderScriptTagByName, renderHighlightJsStyleTag } from '~/service/cdn-resources-loader';
// import { useIndentSize } from '~/stores/editor';
// import { useRendererSettings } from '~/stores/renderer';
// import { EditorMode, useEditorMode, useIsMobile } from '~/stores/ui';
import { IPageWithMeta } from '~/interfaces/page';
import { PageModel } from '~/server/models/page';
import { serializeUserSecurely } from '~/server/models/serializers/user-serializer';
import Xss from '~/services/xss';
import { useSWRxCurrentPage, useSWRxPage, useSWRxPageInfo } from '~/stores/page';
import loggerFactory from '~/utils/logger';

// import { isUserPage, isTrashPage, isSharedPage } from '~/utils/path-utils';

// import GrowiSubNavigation from '../client/js/components/Navbar/GrowiSubNavigation';
// import GrowiSubNavigationSwitcher from '../client/js/components/Navbar/GrowiSubNavigationSwitcher';
// import DisplaySwitcher from '../client/js/components/Page/DisplaySwitcher';
import { BasicLayout } from '../components/BasicLayout';

// import { serializeUserSecurely } from '../server/models/serializers/user-serializer';
// import PageStatusAlert from '../client/js/components/PageStatusAlert';


import {
  useCurrentUser, useCurrentPagePath,
  useOwnerOfCurrentPage, useIsLatestRevision,
  useIsForbidden, useIsNotFound, useIsTrashPage, useShared, useShareLinkId, useIsSharedUser, useIsAbleToDeleteCompletely,
  useAppTitle, useSiteUrl, useConfidential, useIsEnabledStaleNotification,
  useIsSearchServiceConfigured, useIsSearchServiceReachable, useIsMailerSetup,
  useAclEnabled, useHasSlackConfig, useDrawioUri, useHackmdUri, useMathJax, useNoCdn, useEditorConfig, useCsrfToken,
  useCurrentPageId,
} from '../stores/context';
import { useXss } from '../stores/xss';

import { CommonProps, getServerSideCommonProps, useCustomTitle } from './commons';
// import { useCurrentPageSWR } from '../stores/page';


const logger = loggerFactory('growi:pages:all');
const { isUsersHomePage, isTrashPage: _isTrashPage } = pagePathUtils;

type Props = CommonProps & {
  currentUser: string,

  pageWithMetaStr: string,
  // pageUser?: any,
  // redirectTo?: string;
  // redirectFrom?: string;

  // shareLinkId?: string;
  isLatestRevision: boolean

  isForbidden: boolean,
  isNotFound: boolean,
  // isAbleToDeleteCompletely: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  // isMailerSetup: boolean,
  // isAclEnabled: boolean,
  // hasSlackConfig: boolean,
  // drawioUri: string,
  // hackmdUri: string,
  // mathJax: string,
  // noCdn: string,
  // highlightJsStyle: string,
  // isAllReplyShown: boolean,
  // isContainerFluid: boolean,
  // editorConfig: any,
  isEnabledStaleNotification: boolean,
  // isEnabledLinebreaks: boolean,
  // isEnabledLinebreaksInComments: boolean,
  // adminPreferredIndentSize: number,
  // isIndentSizeForced: boolean,
};

const GrowiPage: NextPage<Props> = (props: Props) => {
  // const { t } = useTranslation();
  const router = useRouter();

  const { data: currentUser } = useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);

  // commons
  useAppTitle(props.appTitle);
  useSiteUrl(props.siteUrl);
  useXss(new Xss());
  // useEditorConfig(props.editorConfig);
  useConfidential(props.confidential);
  useCsrfToken(props.csrfToken);

  // page
  useCurrentPagePath(props.currentPathname);
  useIsLatestRevision(props.isLatestRevision);
  // useOwnerOfCurrentPage(props.pageUser != null ? JSON.parse(props.pageUser) : null);
  // useIsForbidden(props.isForbidden);
  // useNotFound(props.isNotFound);
  // useShared(isSharedPage(props.currentPagePath));
  // useShareLinkId(props.shareLinkId);
  // useIsAbleToDeleteCompletely(props.isAbleToDeleteCompletely);
  // useIsSharedUser(props.currentUser == null && isSharedPage(props.currentPagePath));
  useIsEnabledStaleNotification(props.isEnabledStaleNotification);

  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  // useIsMailerSetup(props.isMailerSetup);
  // useAclEnabled(props.isAclEnabled);
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
  // useSWRxPage(pageWithMeta?.data._id);
  useSWRxPageInfo(pageWithMeta?.data._id, undefined, pageWithMeta?.meta); // store initial data
  useIsTrashPage(_isTrashPage(pageWithMeta?.data.path ?? ''));

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


  // // Rewrite browser url by Shallow Routing https://nextjs.org/docs/routing/shallow-routing
  // useEffect(() => {
  //   if (props.redirectTo != null) {
  //     router.push('/[[...path]]', props.redirectTo, { shallow: true });
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

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
                <PageAlerts />
                {/* <DisplaySwitcher /> */}
                DisplaySwitcher<br />
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

      </BasicLayout>
    </>
  );
};

async function injectPageInformation(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const Page = crowi.model('Page');
  const { pageService } = crowi;

  const { user, originalUrl } = req;

  const { currentPathname } = props;

  // retrieve query params
  const url = new URL(originalUrl, props.siteUrl);
  const searchParams = new URLSearchParams(url.search);

  // determine pageId
  const pageIdStr = currentPathname.substring(1);
  const pageId = isValidObjectId(pageIdStr) ? pageIdStr : null;

  const result: IPageWithMeta = await pageService.findPageAndMetaDataByViewer(pageId, currentPathname, user, true); // includeEmpty = true, isSharedPage = false
  const page = result.data;


  if (page == null) {
    const count = pageId != null ? await Page.count({ _id: pageId }) : await Page.count({ path: currentPathname });
    // check the page is forbidden or just does not exist.
    props.isForbidden = count > 0;
    props.isNotFound = true;
    logger.warn(`Page is ${props.isForbidden ? 'forbidden' : 'not found'}`, currentPathname);
  }

  // Todo: should check if revision document with the specified revisionId actually exist in DB.
  // if true, replacing page.revision with old revision should be done when populating Revision
  const revisionId = searchParams.get('revision');
  const isSpecifiedRevisionExist = true; // dummy

  // check if revision is latest
  if (revisionId == null || !isSpecifiedRevisionExist) {
    props.isLatestRevision = true;
  }
  else {
    props.isLatestRevision = page.revision.toString() === revisionId;
  }

  await (page as unknown as PageModel).populateDataToShowRevision();
  props.pageWithMetaStr = JSON.stringify(result);

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

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;
  await injectPageInformation(context, props);

  if (user != null) {
    props.currentUser = JSON.stringify(user);
  }

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  // props.isMailerSetup = mailService.isMailerSetup;
  // props.isAclEnabled = aclService.isAclEnabled();
  // props.hasSlackConfig = slackNotificationService.hasSlackConfig();
  // props.drawioUri = configManager.getConfig('crowi', 'app:drawioUri');
  // props.hackmdUri = configManager.getConfig('crowi', 'app:hackmdUri');
  // props.mathJax = configManager.getConfig('crowi', 'app:mathJax');
  // props.noCdn = configManager.getConfig('crowi', 'app:noCdn');
  // props.highlightJsStyle = configManager.getConfig('crowi', 'customize:highlightJsStyle');
  // props.isAllReplyShown = configManager.getConfig('crowi', 'customize:isAllReplyShown');
  // props.isContainerFluid = configManager.getConfig('crowi', 'customize:isContainerFluid');
  props.isEnabledStaleNotification = configManager.getConfig('crowi', 'customize:isEnabledStaleNotification');
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

  return {
    props,
  };
};

export default GrowiPage;
