import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import { addActivity } from '~/pages/utils/activity';
import { getServerSideCommonInitialProps } from '~/pages/utils/commons';
import type { PageTitleCustomizationProps } from '~/pages/utils/page-title-customization';
import { getServerSidePageTitleCustomizationProps } from '~/pages/utils/page-title-customization';
import { getServerSideSSRProps } from '~/pages/utils/ssr';
import { getServerSideUserUISettingsProps } from '~/pages/utils/user-ui-settings';

import { getServerSideConfigurationProps } from './configuration-props.js';
import { injectPageDataForInitial, injectSameRoutePageData } from './page-data-injectors.js';
import type { InitialProps, SameRouteEachProps } from './types.js';
import { getAction } from './utils.js';

const NEXT_JS_ROUTING_PAGE = '[[...path]]';

// Private helper function to create i18n config
async function createNextI18NextConfig(context: GetServerSidePropsContext, namespacesRequired?: string[]) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  const lang = 'en_US';
  const namespaces = ['commons', ...(namespacesRequired ?? ['translation'])];
  return serverSideTranslations(lang, namespaces);
}

// Common props collection helper
async function collectProps(context: GetServerSidePropsContext, includeConfiguration = true) {
  const propResults = await Promise.all([
    getServerSideCommonInitialProps(context),
    getServerSidePageTitleCustomizationProps(context),
    getServerSideUserUISettingsProps(context),
    ...(includeConfiguration ? [getServerSideConfigurationProps(context)] : []),
  ]);

  // Validate all results have props
  if (propResults.some(result => !('props' in result))) {
    throw new Error('invalid getSSP result');
  }

  return propResults.reduce((acc, result) => ({
    ...acc,
    ...('props' in result ? result.props : {}),
  }), {});
}

// Common user and redirect handling
function handleUserAndRedirects(context: GetServerSidePropsContext, props: Record<string, unknown>) {
  const req = context.req as CrowiRequest;
  const { user } = req;

  // Add current user if exists
  if (user != null) {
    props.currentUser = user.toObject();
  }

  // Check for redirect destination
  const redirectDestination = props.redirectDestination;
  if (typeof redirectDestination === 'string') {
    return {
      redirect: {
        permanent: false,
        destination: redirectDestination,
      },
    };
  }

  return null;
}
export async function getServerSidePropsForInitial(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<InitialProps & SameRouteEachProps>> {
  // Collect all required props
  const collectedProps = await collectProps(context, true);

  const props: InitialProps & SameRouteEachProps = {
    ...collectedProps,
    nextjsRoutingPage: NEXT_JS_ROUTING_PAGE,
    isNotFound: false,
    isForbidden: false,
    isNotCreatable: false,
    isIdenticalPathPage: false, // Will be set by injectPageDataForInitial
  } as InitialProps & SameRouteEachProps;

  // Handle user and redirects
  const redirectResult = handleUserAndRedirects(context, props);
  if (redirectResult) return redirectResult;

  // Inject page data - now handles isIdenticalPathPage internally
  await injectPageDataForInitial(context, props);

  // Handle SSR configuration
  if (props.pageWithMeta?.data != null) {
    const ssrPropsResult = await getServerSideSSRProps(context, props.pageWithMeta.data, ['translation']);
    if ('props' in ssrPropsResult) {
      Object.assign(props, ssrPropsResult.props);
    }
  }
  else {
    props.skipSSR = true;
    const nextI18NextConfig = await createNextI18NextConfig(context, ['translation']);
    props._nextI18Next = nextI18NextConfig._nextI18Next;
  }

  await addActivity(context, getAction(props));

  return { props };
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
    isIdenticalPathPage: false, // Will be set by injectSameRoutePageData
  };

  // Handle user
  const { user } = req;
  if (user != null) {
    props.currentUser = user.toObject();
  }

  // Page data injection - now handles isIdenticalPathPage internally
  await injectSameRoutePageData(context, props);

  return { props };
}
