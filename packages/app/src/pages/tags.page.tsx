import React, { useState, useCallback } from 'react';

import {
  IDataWithMeta, IPageInfoForEntity, IPagePopulatedToShowRevision, isClient, isIPageInfoForEntity, isServer, IUser, IUserHasId, pagePathUtils, pathUtils,
} from '@growi/core';
import ExtensibleCustomError from 'extensible-custom-error';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';


import GrowiContextualSubNavigation from '~/components/Navbar/GrowiContextualSubNavigation';
import GrowiSubNavigationSwitcher from '~/components/Navbar/GrowiSubNavigationSwitcher';
import TagCloudBox from '~/components/TagCloudBox';
import TagList from '~/components/TagList';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { RendererConfig } from '~/interfaces/services/renderer';
import { ISidebarConfig } from '~/interfaces/sidebar-config';
import { IDataTagCount } from '~/interfaces/tag';
import { IUserUISettings } from '~/interfaces/user-ui-settings';
import { PageModel, PageDocument } from '~/server/models/page';
import UserUISettings from '~/server/models/user-ui-settings';
import Xss from '~/services/xss';
import { useSWRxTagsList } from '~/stores/tag';
import {
  usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser, useSidebarCollapsed, useCurrentSidebarContents, useCurrentProductNavWidth,
} from '~/stores/ui';

import { BasicLayout } from '../components/Layout/BasicLayout';
import {
  useCurrentUser, useCurrentPagePath,
  useIsLatestRevision,
  useIsForbidden, useIsNotFound, useIsTrashPage, useIsSharedUser,
  useIsEnabledStaleNotification, useIsIdenticalPath,
  useIsSearchServiceConfigured, useIsSearchServiceReachable, useDisableLinkSharing,
  useHackmdUri,
  useIsAclEnabled, useIsUserPage, useIsNotCreatable,
  useCsrfToken, useIsSearchScopeChildrenAsDefault, useCurrentPageId, useCurrentPathname,
  useIsSlackConfigured, useIsBlinkedHeaderAtBoot, useRendererConfig, useEditingMarkdown,
} from '../stores/context';
import { useXss } from '../stores/xss';

import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps, useCustomTitle,
} from './utils/commons';

const PAGING_LIMIT = 10;

const {
  isPermalink: _isPermalink, isUsersHomePage, isTrashPage: _isTrashPage, isUserPage, isCreatablePage,
} = pagePathUtils;

const { removeHeadingSlash } = pathUtils;

type IPageToShowRevisionWithMeta = IDataWithMeta<IPagePopulatedToShowRevision & PageDocument, IPageInfoForEntity>;

type Props = CommonProps & {
  currentUser: IUser,

  pageWithMeta: IPageToShowRevisionWithMeta,
  // pageUser?: any,
  // redirectTo?: string;
  // redirectFrom?: string;

  // shareLinkId?: string;
  isLatestRevision?: boolean

  isIdenticalPathPage?: boolean,
  isForbidden: boolean,
  isNotFound: boolean,
  IsNotCreatable: boolean,
  // isAbleToDeleteCompletely: boolean,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,

  isSlackConfigured: boolean,
  // isMailerSetup: boolean,
  isAclEnabled: boolean,
  // hasSlackConfig: boolean,
  // drawioUri: string,
  hackmdUri: string,
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
  disableLinkSharing: boolean,

  rendererConfig: RendererConfig,

  // UI
  userUISettings?: IUserUISettings
  // Sidebar
  sidebarConfig: ISidebarConfig,
};

const TagPage: NextPage<CommonProps> = (props: Props) => {
  const [activePage, setActivePage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);

  const GrowiSubNavigationSwitcher = dynamic(() => import('../components/Navbar/GrowiSubNavigationSwitcher'), { ssr: false });

  const { data: tagDataList, error } = useSWRxTagsList(PAGING_LIMIT, offset);
  const tagData: IDataTagCount[] = tagDataList?.data || [];
  const totalCount: number = tagDataList?.totalCount || 0;
  const isLoading = tagDataList === undefined && error == null;

  const { t } = useTranslation('');

  // commons
  useXss(new Xss());

  // UserUISettings
  usePreferDrawerModeByUser(props.userUISettings?.preferDrawerModeByUser ?? props.sidebarConfig.isSidebarDrawerMode);
  usePreferDrawerModeOnEditByUser(props.userUISettings?.preferDrawerModeOnEditByUser);
  useSidebarCollapsed(props.userUISettings?.isSidebarCollapsed ?? props.sidebarConfig.isSidebarClosedAtDockMode);
  useCurrentSidebarContents(props.userUISettings?.currentSidebarContents);
  useCurrentProductNavWidth(props.userUISettings?.currentProductNavWidth);

  // page
  useCurrentPagePath(props.currentPathname);
  useIsLatestRevision(props.isLatestRevision);
  // useOwnerOfCurrentPage(props.pageUser != null ? JSON.parse(props.pageUser) : null);
  useIsForbidden(props.isForbidden);
  useIsNotFound(props.isNotFound);
  useIsNotCreatable(props.IsNotCreatable);
  // useIsTrashPage(_isTrashPage(props.currentPagePath));
  // useShared();
  // useShareLinkId(props.shareLinkId);
  useIsSharedUser(false); // this page cann't be routed for '/share'
  useIsIdenticalPath(false); // TODO: need to initialize from props
  // useIsAbleToDeleteCompletely(props.isAbleToDeleteCompletely);
  useIsEnabledStaleNotification(props.isEnabledStaleNotification);
  useIsBlinkedHeaderAtBoot(false);

  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  useIsSlackConfigured(props.isSlackConfigured);
  // useIsMailerSetup(props.isMailerSetup);
  useIsAclEnabled(props.isAclEnabled);
  // useHasSlackConfig(props.hasSlackConfig);
  // useDrawioUri(props.drawioUri);
  useHackmdUri(props.hackmdUri);
  // useMathJax(props.mathJax);
  // useNoCdn(props.noCdn);
  // useIndentSize(props.adminPreferredIndentSize);
  useDisableLinkSharing(props.disableLinkSharing);

  useRendererConfig(props.rendererConfig);
  // useRendererSettings(props.rendererSettingsStr != null ? JSON.parse(props.rendererSettingsStr) : undefined);
  // useGrowiRendererConfig(props.growiRendererConfigStr != null ? JSON.parse(props.growiRendererConfigStr) : undefined);

  const setOffsetByPageNumber = useCallback((selectedPageNumber: number) => {
    setActivePage(selectedPageNumber);
    setOffset((selectedPageNumber - 1) * PAGING_LIMIT);
  }, []);

  // todo: adjust margin and redesign tags page
  return (
    <>
      <Head>
      </Head>
      <BasicLayout title='tags'>
        <header className="py-0">
          <GrowiContextualSubNavigation isLinkSharingDisabled={props.disableLinkSharing} />
        </header>
        <div className="d-edit-none">
          <GrowiSubNavigationSwitcher />
        </div>
        <div id="grw-subnav-sticky-trigger" className="sticky-top"></div>
        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>
        <div className="grw-container-convertible mb-5 pb-5">
          <h2 className="my-3">{`${t('Tags')}(${totalCount})`}</h2>
          <div className="px-3 mb-5 text-center">
            <TagCloudBox tags={tagData} minSize={20} />
          </div>
          { isLoading
            ? (
              <div className="text-muted text-center">
                <i className="fa fa-2x fa-spinner fa-pulse mt-3"></i>
              </div>
            )
            : (
              <div data-testid="grw-tags-list">
                <TagList
                  tagData={tagData}
                  totalTags={totalCount}
                  activePage={activePage}
                  onChangePage={setOffsetByPageNumber}
                  pagingLimit={PAGING_LIMIT}
                />
              </div>
            )
          }
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
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { revisionId } = req.query;

  const Page = crowi.model('Page') as PageModel;
  const { pageService } = crowi;

  const { currentPathname } = props;

  const pageId = getPageIdFromPathname(currentPathname);
  const isPermalink = _isPermalink(currentPathname);

  const { user } = req;

  // check whether the specified page path hits to multiple pages
  if (!isPermalink) {
    const count = await Page.countByPathAndViewer(currentPathname, user, null, true);
    if (count > 1) {
      throw new MultiplePagesHitsError(currentPathname);
    }
  }

  const pageWithMeta: IPageToShowRevisionWithMeta = await pageService.findPageAndMetaDataByViewer(pageId, currentPathname, user, true); // includeEmpty = true, isSharedPage = false
  const page = pageWithMeta?.data as unknown as PageDocument;

  // populate & check if the revision is latest
  if (page != null) {
    page.initLatestRevisionField(revisionId);
    await page.populateDataToShowRevision();
    props.isLatestRevision = page.isLatestRevision();
  }

  props.pageWithMeta = pageWithMeta;
}

async function injectUserUISettings(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;

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
    props.IsNotCreatable = !isCreatablePage(currentPathname);
    // check the page is forbidden or just does not exist.
    const count = isPermalink ? await Page.count({ _id: pageId }) : await Page.count({ path: currentPathname });
    props.isForbidden = count > 0;
  }
  else {
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
  // props.drawioUri = configManager.getConfig('crowi', 'app:drawioUri');
  props.hackmdUri = configManager.getConfig('crowi', 'app:hackmdUri');
  // props.mathJax = configManager.getConfig('crowi', 'app:mathJax');
  // props.noCdn = configManager.getConfig('crowi', 'app:noCdn');
  // props.highlightJsStyle = configManager.getConfig('crowi', 'customize:highlightJsStyle');
  // props.isAllReplyShown = configManager.getConfig('crowi', 'customize:isAllReplyShown');
  // props.isContainerFluid = configManager.getConfig('crowi', 'customize:isContainerFluid');
  props.isEnabledStaleNotification = configManager.getConfig('crowi', 'customize:isEnabledStaleNotification');
  // props.isEnabledLinebreaks = configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks');
  // props.isEnabledLinebreaksInComments = configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments');
  props.disableLinkSharing = configManager.getConfig('crowi', 'security:disableLinkSharing');
  // props.editorConfig = {
  //   upload: {
  //     image: crowi.fileUploadService.getIsUploadable(),
  //     file: crowi.fileUploadService.getFileUploadEnabled(),
  //   },
  // };
  // props.adminPreferredIndentSize = configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize');
  // props.isIndentSizeForced = configManager.getConfig('markdown', 'markdown:isIndentSizeForced');

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

async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;
  console.log(user);

  const result = await getServerSideCommonProps(context);


  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

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

export default TagPage;
