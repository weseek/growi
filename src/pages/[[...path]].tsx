import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import Head from 'next/head';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { renderScriptTagByName, renderHighlightJsStyleTag } from '~/service/cdn-resources-loader';
import loggerFactory from '~/utils/logger';
import { CommonProps, getServerSideCommonProps } from '~/utils/nextjs-page-utils';

import BasicLayout from '../components/BasicLayout';

import {
  useCurrentUser, useAppTitle, useSiteUrl, useConfidential,
  useSearchServiceConfigured, useSearchServiceReachable,
} from '../stores/context';


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

  let page: any;
  let header: string;

  if (props.page != null) {
    page = JSON.parse(props.page);
    header = page.path;
  }
  else {
    header = props.isForbidden ? 'Forbidden' : 'Not found';
  }


  return (
    <>
      <Head>
        {renderScriptTagByName('drawio-viewer')}
        {renderScriptTagByName('mathjax')}
        {renderScriptTagByName('highlight-addons')}
        {renderHighlightJsStyleTag(props.highlightJsStyle)}
      </Head>
      <BasicLayout title="GROWI">
        <h1>{header}</h1>
        { page && (
          <p>
            {page.revision.body}
          </p>
        ) }
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

  const { path, user } = req;

  // define props generator method
  const injectPageInformation = async(props: Props, pagePath: string): Promise<void> => {
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
  await injectPageInformation(props, path);

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
