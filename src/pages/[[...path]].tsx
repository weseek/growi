import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import Head from 'next/head';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { renderScriptTagByName, renderHighlightJsStyleTag } from '~/service/cdn-resources-loader';
import loggerFactory from '~/utils/logger';
import { CommonProps, getServerSideCommonProps } from '~/utils/nextjs-page-utils';

import BasicLayout from '../components/BasicLayout';

// import GrowiSubNavigation from '../client/js/components/Navbar/GrowiSubNavigation';
// import GrowiSubNavigationSwitcher from '../client/js/components/Navbar/GrowiSubNavigationSwitcher';
// import DisplaySwitcher from '../client/js/components/Page/DisplaySwitcher';
// import PageStatusAlert from '../client/js/components/PageStatusAlert';

import {
  useCurrentUser, useCurrentPagePath, useAppTitle, useSiteUrl, useConfidential,
  useSearchServiceConfigured, useSearchServiceReachable,
} from '../stores/context';
import {
  usePageSWR,
} from '../stores/page';


const logger = loggerFactory('growi:pages:all');

type Props = CommonProps & {
  currentUser: any,

  page: any,

  appTitle: string,
  siteUrl: string,
  confidential: string,
  isForbidden: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  highlightJsStyle: string,
};

const GrowiPage: NextPage<Props> = (props: Props) => {

  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);
  useAppTitle(props.appTitle);
  useSiteUrl(props.siteUrl);
  useConfidential(props.confidential);
  useSearchServiceConfigured(props.isSearchServiceConfigured);
  useSearchServiceReachable(props.isSearchServiceReachable);

  const { data: currentPagePath } = useCurrentPagePath(props.currentPagePath);

  let page;
  if (props.page != null) {
    page = JSON.parse(props.page);
  }
  usePageSWR(currentPagePath, page);

  const isUserPage = false; // TODO: switch with page path

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

        <div id="main" className={`main ${isUserPage && 'user-page'}`}>

          <div className="row">
            <div className="col grw-page-content-container">
              <div id="content-main" className="content-main container">
                {/* <DisplaySwitcher /> */}
                <script type="text/template" id="raw-text-original">{page?.revision.body}</script>
                <div id="page-editor-navbar-bottom-container" className="d-none d-edit-block"></div>
                {/* <PageStatusAlert /> */}
              </div>
            </div>
            <div className="col-xl-2 col-lg-3 d-none d-lg-block revision-toc-container">
              <div id="revision-toc" className="revision-toc mt-3 sps sps--abv" data-sps-offset="123">
                <div id="revision-toc-content" className="revision-toc-content"></div>
              </div>
            </div>
          </div>

        </div>

      </BasicLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const PageModel = crowi.model('Page');
  const {
    appService, pageService, searchService, configManager,
  } = crowi;

  const { user } = req;

  // define props generator method
  const injectPageInformation = async(props: Props, specifiedPagePath?: string): Promise<void> => {
    const pagePath = specifiedPagePath || props.currentPagePath;
    const page = await PageModel.findByPathAndViewer(pagePath, user);

    if (page == null) {
      // check the page is forbidden or just does not exist.
      props.isForbidden = await PageModel.count({ path: pagePath }) > 0;
      logger.warn(`Page is ${props.isForbidden ? 'forbidden' : 'not found'}`, pagePath);
      return;
    }

    // get props recursively
    if (page.redirectTo) {
      logger.debug(`Redirect to '${page.redirectTo}'`);
      return injectPageInformation(props, page.redirectTo);
    }

    await page.populateDataToShowRevision();
    props.page = JSON.stringify(pageService.serializeToObj(page));
  };

  const result = await getServerSideCommonProps(context);
  const props: Props = result.props as Props;
  await injectPageInformation(props);

  if (user != null) {
    props.currentUser = JSON.stringify(user.toObject());
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
