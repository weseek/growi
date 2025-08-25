import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { addActivity } from '~/pages/utils/activity';
import { getServerSideI18nProps } from '~/pages/utils/i18n';
import type { PageTitleCustomizationProps } from '~/pages/utils/page-title-customization';
import { getServerSidePageTitleCustomizationProps } from '~/pages/utils/page-title-customization';
import type { ServerConfigurationInitialProps } from '~/states/server-configurations/hydrate';

import type { CommonInitialProps, CommonEachProps } from '../utils/commons';
import { getServerSideCommonInitialProps, getServerSideCommonEachProps } from '../utils/commons';
import type { UserUISettingsProps } from '../utils/user-ui-settings';
import { getServerSideUserUISettingsProps } from '../utils/user-ui-settings';

import {
  NEXT_JS_ROUTING_PAGE,
  mergeGetServerSidePropsResults,
} from './common-helpers';
import { getServerSideConfigurationProps } from './configuration-props';
import { getPageDataForInitial, getPageDataForSameRoute } from './page-data-props';
import type { InitialProps, SameRouteEachProps } from './types';
import { isValidInitialAndSameRouteProps, isValidSameRouteProps } from './types';
import { getAction } from './utils';

// Common props collection helper with improved type safety
async function getServerSideBasisProps(context: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<CommonEachProps & CommonInitialProps & PageTitleCustomizationProps & UserUISettingsProps & ServerConfigurationInitialProps>
> {
  const [
    commonEachResult,
    commonInitialResult,
    pageTitleResult,
    userUIResult,
    configResult,
  ] = await Promise.all([
    getServerSideCommonEachProps(context),
    getServerSideCommonInitialProps(context),
    getServerSidePageTitleCustomizationProps(context),
    getServerSideUserUISettingsProps(context),
    getServerSideConfigurationProps(context),
  ]);

  const nextjsRoutingProps = {
    props: { nextjsRoutingPage: NEXT_JS_ROUTING_PAGE },
  };

  // Return the merged result
  return mergeGetServerSidePropsResults(commonEachResult,
    mergeGetServerSidePropsResults(commonInitialResult,
      mergeGetServerSidePropsResults(pageTitleResult,
        mergeGetServerSidePropsResults(userUIResult,
          mergeGetServerSidePropsResults(configResult, nextjsRoutingProps)))));
}

export async function getServerSidePropsForInitial(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<InitialProps & SameRouteEachProps>> {
  //
  // STAGE 1
  //

  // Collect all required props with type safety (includes CommonEachProps now)
  const basisPropsResult = await getServerSideBasisProps(context);

  // Handle early return cases (redirect/notFound)
  if ('redirect' in basisPropsResult || 'notFound' in basisPropsResult) {
    return basisPropsResult;
  }

  const basisProps = await basisPropsResult.props;

  // Handle redirect destination from common props
  if (basisProps.redirectDestination != null) {
    return {
      redirect: {
        permanent: false,
        destination: basisProps.redirectDestination,
      },
    };
  }

  //
  // STAGE 2
  //
  const initialPropsResult = mergeGetServerSidePropsResults(
    basisPropsResult,
    {
      props: {
        isNotFound: false,
        isForbidden: false,
        isNotCreatable: false,
      },
    },
  );

  //
  // STAGE 3
  //

  // Get page data and i18n props concurrently
  const [pageDataResult, i18nPropsResult] = await Promise.all([
    getPageDataForInitial(context),
    getServerSideI18nProps(context, ['translation']),
  ]);

  // Merge all results in a type-safe manner (using sequential merging)
  const mergedResult = mergeGetServerSidePropsResults(initialPropsResult,
    mergeGetServerSidePropsResults(pageDataResult, i18nPropsResult));

  // Check for early return (redirect/notFound)
  if ('redirect' in mergedResult || 'notFound' in mergedResult) {
    return mergedResult;
  }

  // Type-safe props validation AFTER skipSSR is properly set
  if (!isValidInitialAndSameRouteProps(mergedResult.props)) {
    throw new Error('Invalid merged props structure');
  }

  await addActivity(context, getAction(mergedResult.props));
  return { props: mergedResult.props };
}

export async function getServerSidePropsForSameRoute(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<SameRouteEachProps>> {
  //
  // STAGE 1
  //

  // Get combined props but extract only what's needed for SameRoute
  const basisPropsResult = await getServerSideBasisProps(context);

  // Handle early return cases (redirect/notFound)
  if ('redirect' in basisPropsResult || 'notFound' in basisPropsResult) {
    return basisPropsResult;
  }

  const basisProps = await basisPropsResult.props;

  // Handle redirect destination from common props
  if (basisProps.redirectDestination != null) {
    return {
      redirect: {
        permanent: false,
        destination: basisProps.redirectDestination,
      },
    };
  }

  //
  // STAGE 2
  //
  const sameRoutePropsResult = mergeGetServerSidePropsResults(
    basisPropsResult,
    {
      props: {},
    },
  );

  //
  // STAGE 3
  //

  // Get page data
  const sameRouteDataResult = await getPageDataForSameRoute(context);

  // Merge results in a type-safe manner
  const mergedResult = mergeGetServerSidePropsResults(sameRoutePropsResult, sameRouteDataResult);

  // Check for early return (redirect/notFound)
  if ('redirect' in mergedResult || 'notFound' in mergedResult) {
    return mergedResult;
  }

  // Validate the merged props have all required properties
  if (!isValidSameRouteProps(mergedResult.props)) {
    throw new Error('Invalid same route props structure');
  }
  const mergedProps = mergedResult.props;

  return { props: mergedProps };
}
