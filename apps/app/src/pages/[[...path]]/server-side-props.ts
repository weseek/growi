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
export async function collectCombinedProps(context: GetServerSidePropsContext): Promise<
  CommonEachProps & CommonInitialProps & PageTitleCustomizationProps & UserUISettingsProps & ServerConfigurationInitialProps
> {
  const propResults = await Promise.all([
    getServerSideCommonEachProps(context),
    getServerSideCommonInitialProps(context),
    getServerSidePageTitleCustomizationProps(context),
    getServerSideUserUISettingsProps(context),
    getServerSideConfigurationProps(context),
  ]);

  // Type-safe merging of GetServerSidePropsResult (5-way merge)
  const [commonEachResult, commonInitialResult, pageTitleResult, userUIResult, configResult] = propResults;

  // First merge pairs, then combine
  const firstPairResult = mergeGetServerSidePropsResults(commonEachResult, commonInitialResult);
  const secondPairResult = mergeGetServerSidePropsResults(pageTitleResult, userUIResult);
  const thirdPairResult = mergeGetServerSidePropsResults(firstPairResult, secondPairResult);
  const finalResult = mergeGetServerSidePropsResults(thirdPairResult, configResult);

  // Handle early returns (redirect/notFound)
  if ('redirect' in finalResult || 'notFound' in finalResult) {
    throw new Error('Unexpected redirect or notFound in props collection');
  }

  // Return the merged props
  return finalResult.props;
}

// Type-safe helper for creating base props
type BaseInitialProps = {
  nextjsRoutingPage: string;
  isNotFound: boolean;
  isForbidden: boolean;
  isNotCreatable: boolean;
  isIdenticalPathPage: boolean;
};

export async function getServerSidePropsForInitial(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<InitialProps & SameRouteEachProps>> {
  //
  // STAGE 1
  //

  // Collect all required props with type safety (includes CommonEachProps now)
  const collectedProps = await collectCombinedProps(context);

  // Handle redirect destination from common props
  if (collectedProps.redirectDestination != null) {
    return {
      redirect: {
        permanent: false,
        destination: collectedProps.redirectDestination,
      },
    };
  }

  //
  // STAGE 2
  //

  const baseProps: BaseInitialProps = {
    nextjsRoutingPage: NEXT_JS_ROUTING_PAGE,
    isNotFound: false,
    isForbidden: false,
    isNotCreatable: false,
    isIdenticalPathPage: false,
  };

  // Combine all props in a type-safe manner
  const initialProps = {
    ...collectedProps,
    ...baseProps,
  };

  //
  // STAGE 3
  //

  // Create a result with initial props
  const initialPropsResult: GetServerSidePropsResult<typeof initialProps> = {
    props: initialProps,
  };

  // Get page data and i18n props concurrently
  const [pageDataResult, i18nPropsResult] = await Promise.all([
    getPageDataForInitial(context),
    getServerSideI18nProps(context, ['translation']),
  ]);

  // Merge all results in a type-safe manner
  const mergedResult = mergeGetServerSidePropsResults(
    initialPropsResult,
    pageDataResult,
    i18nPropsResult,
  );

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
  // Get combined props but extract only what's needed for SameRoute
  const collectedProps = await collectCombinedProps(context);

  // Handle redirect destination from common props
  if (collectedProps.redirectDestination != null) {
    return {
      redirect: {
        permanent: false,
        destination: collectedProps.redirectDestination,
      },
    };
  }

  // Create base props for same route navigation
  const baseProps: SameRouteEachProps = {
    currentPathname: collectedProps.currentPathname,
    currentUser: collectedProps.currentUser,
    csrfToken: collectedProps.csrfToken,
    isMaintenanceMode: collectedProps.isMaintenanceMode,
    redirectDestination: collectedProps.redirectDestination,
    appTitle: collectedProps.appTitle,
    customTitleTemplate: collectedProps.customTitleTemplate,
    nextjsRoutingPage: NEXT_JS_ROUTING_PAGE,
    isIdenticalPathPage: false,
  };

  // Create a result with base props
  const basePropsResult: GetServerSidePropsResult<SameRouteEachProps> = {
    props: baseProps,
  };

  // Get page data
  const sameRouteDataResult = await getPageDataForSameRoute(context);

  // Merge results in a type-safe manner
  const mergedResult = mergeGetServerSidePropsResults(basePropsResult, sameRouteDataResult);

  // Check for early return (redirect/notFound)
  if ('redirect' in mergedResult || 'notFound' in mergedResult) {
    return mergedResult as GetServerSidePropsResult<SameRouteEachProps>;
  }

  // Validate the merged props have all required properties
  if (!isValidSameRouteProps(mergedResult.props)) {
    throw new Error('Invalid same route props structure');
  }
  const mergedProps = mergedResult.props;

  return { props: mergedProps };
}
