import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import Head from 'next/head';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { renderScriptTagByName, renderHighlightJsStyleTag } from '~/service/cdn-resources-loader';
import loggerFactory from '~/utils/logger';
import { CommonProps, getServerSideCommonProps } from '~/utils/nextjs-page-utils';
import { isUserPage } from '~/utils/path-utils';

import { serializeUserSecurely } from '../server/models/serializers/user-serializer';
import BasicLayout from '../components/BasicLayout';

// import GrowiSubNavigation from '../client/js/components/Navbar/GrowiSubNavigation';
// import GrowiSubNavigationSwitcher from '../client/js/components/Navbar/GrowiSubNavigationSwitcher';
// import DisplaySwitcher from '../client/js/components/Page/DisplaySwitcher';
// import PageStatusAlert from '../client/js/components/PageStatusAlert';

import {
  useCurrentUser, useCurrentPagePath, useOwnerOfCurrentPage,
  useForbidden, useNotFound, useIsAbleToDeleteCompletely,
  useAppTitle, useSiteUrl, useConfidential,
  useSearchServiceConfigured, useSearchServiceReachable,
} from '../stores/context';
import {
  useCurrentPageSWR,
} from '../stores/page';


const logger = loggerFactory('growi:pages:all');

type Props = CommonProps & {
  currentUser: any,

  page: any,
  pageUser?: any,
  redirectTo?: string;
  redirectFrom?: string;

  appTitle: string,
  siteUrl: string,
  confidential: string,
  isForbidden: boolean,
  isNotFound: boolean,
  isAbleToDeleteCompletely: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  highlightJsStyle: string,
};

const GrowiPage: NextPage<Props> = (props: Props) => {
  const router = useRouter();

  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);
  useCurrentPagePath(props.currentPagePath);
  useOwnerOfCurrentPage(props.pageUser != null ? JSON.parse(props.pageUser) : null);
  useForbidden(props.isForbidden);
  useNotFound(props.isNotFound);
  useIsAbleToDeleteCompletely(props.isAbleToDeleteCompletely);
  useAppTitle(props.appTitle);
  useSiteUrl(props.siteUrl);
  useConfidential(props.confidential);
  useSearchServiceConfigured(props.isSearchServiceConfigured);
  useSearchServiceReachable(props.isSearchServiceReachable);

  let page;
  if (props.page != null) {
    page = JSON.parse(props.page);
  }
  useCurrentPageSWR(page);

  // Rewrite browser url by Shallow Routing https://nextjs.org/docs/routing/shallow-routing
  useEffect(() => {
    if (props.redirectTo != null) {
      router.push('/[[...path]]', props.redirectTo, { shallow: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <>
      <Head>
        {renderScriptTagByName('drawio-viewer')}
        {renderScriptTagByName('mathjax')}
        {renderScriptTagByName('highlight-addons')}
        {renderHighlightJsStyleTag(props.highlightJsStyle)}
      </Head>
      <BasicLayout title="GROWI">
        <header className="py-0">
          {/* <GrowiSubNavigation /> */}
        </header>
        <div className="d-edit-none">
          {/* <GrowiSubNavigationSwitcher /> */}
        </div>

        <div id="grw-subnav-sticky-trigger" className="sticky-top"></div>
        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>

        <div id="main" className={`main ${isUserPage(props.currentPagePath) && 'user-page'}`}>

          <div className="row">
            <div className="col grw-page-content-container">
              <div id="content-main" className="content-main container">
                {/* <DisplaySwitcher /> */}
                <div id="page-editor-navbar-bottom-container" className="d-none d-edit-block"></div>
                {/* <PageStatusAlert /> */}
              </div>
            </div>

            {/* <div className="col-xl-2 col-lg-3 d-none d-lg-block revision-toc-container">
              <div id="revision-toc" className="revision-toc mt-3 sps sps--abv" data-sps-offset="123">
                <div id="revision-toc-content" className="revision-toc-content"></div>
              </div>
            </div> */}
          </div>

        </div>

      </BasicLayout>
    </>
  );
};

async function injectPageInformation(context: GetServerSidePropsContext, props: Props, specifiedPagePath?: string): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const PageModel = crowi.model('Page');
  const { pageService } = crowi;

  const { user } = req;

  const pagePath = specifiedPagePath || props.currentPagePath;
  const page = await PageModel.findByPathAndViewer(pagePath, user);

  if (page == null) {
    // check the page is forbidden or just does not exist.
    props.isForbidden = await PageModel.count({ path: pagePath }) > 0;
    props.isNotFound = !props.isForbidden;
    logger.warn(`Page is ${props.isForbidden ? 'forbidden' : 'not found'}`, pagePath);
    return;
  }

  // get props recursively
  if (page.redirectTo) {
    // Pass to rewrite browser url
    props.redirectTo = page.redirectTo;
    props.redirectFrom = pagePath;
    logger.debug(`Redirect to '${page.redirectTo}'`);
    return injectPageInformation(context, props, page.redirectTo);
  }

  await page.populateDataToShowRevision();
  props.page = JSON.stringify(serializeUserSecurely(page));
}

async function injectPageUserInformation(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const UserModel = crowi.model('User');

  if (isUserPage(props.currentPagePath)) {
    const user = await UserModel.findUserByUsername(UserModel.getUsernameByPath(props.currentPagePath));

    if (user != null) {
      props.pageUser = JSON.stringify(user.toObject());
    }
  }
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, searchService, configManager,
  } = crowi;

  const { user } = req;

  const result = await getServerSideCommonProps(context);
  const props: Props = result.props as Props;
  await injectPageInformation(context, props);
  await injectPageUserInformation(context, props);

  if (user != null) {
    props.currentUser = JSON.stringify(user.toObject());
    props.isAbleToDeleteCompletely = user.canDeleteCompletely(props.page?.creator?._id);
  }

  props.siteUrl = appService.getSiteUrl();
  props.confidential = appService.getAppConfidential();
  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.highlightJsStyle = configManager.getConfig('crowi', 'customize:highlightJsStyle');

  return {
    props,
  };
};

export default GrowiPage;
