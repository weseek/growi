import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import { addActivity } from '~/pages/utils/activity';
import type { PageTitleCustomizationProps } from '~/pages/utils/page-title-customization';
import { getServerSidePageTitleCustomizationProps } from '~/pages/utils/page-title-customization';
import { getServerSideSSRProps } from '~/pages/utils/ssr';

import {
  NEXT_JS_ROUTING_PAGE,
  collectProps,
  createNextI18NextConfig,
  handleUserAndRedirects,
  handlePageDataResult,
} from './common-helpers';
import { getPageDataForInitial, getPageDataForSameRoute } from './page-data-props';
import type { InitialProps, SameRouteEachProps } from './types';
import { getAction } from './utils';

export async function getServerSidePropsForInitial(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<InitialProps & SameRouteEachProps>> {
  // Collect all required props
  const collectedProps = await collectProps(context);

  const props: InitialProps & SameRouteEachProps = {
    ...collectedProps,
    nextjsRoutingPage: NEXT_JS_ROUTING_PAGE,
    isNotFound: false,
    isForbidden: false,
    isNotCreatable: false,
    isIdenticalPathPage: false,
  } as InitialProps & SameRouteEachProps;

  // Handle user and redirects
  const redirectResult = handleUserAndRedirects(context, props);
  if (redirectResult) return redirectResult;

  // Get page data
  const pageDataResult = await getPageDataForInitial(context);
  const handleResult = handlePageDataResult(pageDataResult, props);
  if ('earlyReturn' in handleResult) return handleResult.earlyReturn as GetServerSidePropsResult<InitialProps & SameRouteEachProps>;

  // Use merged props from page data
  const mergedProps = handleResult.mergedProps as InitialProps & SameRouteEachProps;

  // Handle SSR configuration
  if (mergedProps.pageWithMeta?.data != null) {
    const ssrPropsResult = await getServerSideSSRProps(context, mergedProps.pageWithMeta.data, ['translation']);
    if ('props' in ssrPropsResult) {
      Object.assign(mergedProps, ssrPropsResult.props);
    }
  }
  else {
    mergedProps.skipSSR = true;
    const nextI18NextConfig = await createNextI18NextConfig(context, ['translation']);
    mergedProps._nextI18Next = nextI18NextConfig._nextI18Next;
  }

  await addActivity(context, getAction(mergedProps));
  return { props: mergedProps };
}

export async function getServerSidePropsForSameRoute(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<SameRouteEachProps>> {
  // Get minimal props for same-route navigation
  const pageTitleResult = await getServerSidePageTitleCustomizationProps(context);
  if (!('props' in pageTitleResult)) {
    throw new Error('invalid getSSP result');
  }

  const { appTitle, customTitleTemplate } = pageTitleResult.props as PageTitleCustomizationProps;
  const req = context.req as CrowiRequest;

  const props: SameRouteEachProps = {
    appTitle,
    customTitleTemplate,
    currentPathname: decodeURIComponent(context.resolvedUrl?.split('?')[0] ?? '/'),
    nextjsRoutingPage: NEXT_JS_ROUTING_PAGE,
    csrfToken: req.csrfToken?.() ?? '',
    isMaintenanceMode: req.crowi.configManager.getConfig('app:isMaintenanceMode'),
    isIdenticalPathPage: false,
  };

  // Handle user
  const { user } = req;
  if (user != null) {
    props.currentUser = user.toObject();
  }

  // Page data retrieval
  const sameRouteDataResult = await getPageDataForSameRoute(context);
  const handleResult = handlePageDataResult(sameRouteDataResult, props);
  if ('earlyReturn' in handleResult) return handleResult.earlyReturn as GetServerSidePropsResult<SameRouteEachProps>;

  // Use merged props from same route data
  const mergedProps = handleResult.mergedProps as SameRouteEachProps;

  return { props: mergedProps };
}
