import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { addActivity } from '~/pages/utils/activity';
import { getServerSideI18nProps } from '~/pages/utils/i18n';

import { getServerSideCommonInitialProps, getServerSideCommonEachProps } from '../utils/commons';
import { getServerSideUserUISettingsProps } from '../utils/user-ui-settings';

import { mergeGetServerSidePropsResults } from '../general-page/common-helpers';
import { getServerSideConfigurationProps, getServerSideRendererConfigProps, getServerSideSidebarConfigProps } from '../general-page/configuration-props';
import { NEXT_JS_ROUTING_PAGE } from './consts';
import { getActivityAction } from '../general-page/get-activity-action';
import { getPageDataForInitial, getPageDataForSameRoute } from './page-data-props';
import type { InitialProps, SameRouteEachProps } from '../general-page/types';
import { isValidInitialAndSameRouteProps, isValidSameRouteProps } from '../general-page/types';

const nextjsRoutingProps = {
  props: {
    nextjsRoutingPage: NEXT_JS_ROUTING_PAGE,
  },
};

export async function getServerSidePropsForInitial(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<InitialProps & SameRouteEachProps>> {
  //
  // STAGE 1
  //

  const commonEachPropsResult = await getServerSideCommonEachProps(context);
  // Handle early return cases (redirect/notFound)
  if ('redirect' in commonEachPropsResult || 'notFound' in commonEachPropsResult) {
    return commonEachPropsResult;
  }
  const commonEachProps = await commonEachPropsResult.props;

  // Handle redirect destination from common props
  if (commonEachProps.redirectDestination != null) {
    return {
      redirect: {
        permanent: false,
        destination: commonEachProps.redirectDestination,
      },
    };
  }

  //
  // STAGE 2
  //

  const [
    commonInitialResult,
    userUIResult,
    serverConfigResult,
    rendererConfigResult,
    sidebarConfigResult,
    i18nPropsResult,
    pageDataResult,
  ] = await Promise.all([
    getServerSideCommonInitialProps(context),
    getServerSideUserUISettingsProps(context),
    getServerSideConfigurationProps(context),
    getServerSideRendererConfigProps(context),
    getServerSideSidebarConfigProps(context),
    getServerSideI18nProps(context, ['translation']),
    getPageDataForInitial(context),
  ]);

  // Merge all results in a type-safe manner (using sequential merging)
  const mergedResult = mergeGetServerSidePropsResults(commonEachPropsResult,
    mergeGetServerSidePropsResults(commonInitialResult,
      mergeGetServerSidePropsResults(userUIResult,
        mergeGetServerSidePropsResults(serverConfigResult,
          mergeGetServerSidePropsResults(rendererConfigResult,
            mergeGetServerSidePropsResults(sidebarConfigResult,
              mergeGetServerSidePropsResults(i18nPropsResult,
                mergeGetServerSidePropsResults(pageDataResult, nextjsRoutingProps))))))));

  // Check for early return (redirect/notFound)
  if ('redirect' in mergedResult || 'notFound' in mergedResult) {
    return mergedResult;
  }

  const mergedProps = await mergedResult.props;

  // Type-safe props validation AFTER skipSSR is properly set
  if (!isValidInitialAndSameRouteProps(mergedProps)) {
    throw new Error('Invalid merged props structure');
  }

  await addActivity(context, getActivityAction(mergedProps));
  return mergedResult;
}

export async function getServerSidePropsForSameRoute(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<SameRouteEachProps>> {
  //
  // STAGE 1
  //

  const commonEachPropsResult = await getServerSideCommonEachProps(context);
  // Handle early return cases (redirect/notFound)
  if ('redirect' in commonEachPropsResult || 'notFound' in commonEachPropsResult) {
    return commonEachPropsResult;
  }
  const commonEachProps = await commonEachPropsResult.props;

  // Handle redirect destination from common props
  if (commonEachProps.redirectDestination != null) {
    return {
      redirect: {
        permanent: false,
        destination: commonEachProps.redirectDestination,
      },
    };
  }

  //
  // STAGE 2
  //

  // Get page data
  const sameRoutePageDataResult = await getPageDataForSameRoute(context);

  // Merge results in a type-safe manner
  const mergedResult = mergeGetServerSidePropsResults(commonEachPropsResult,
    mergeGetServerSidePropsResults(sameRoutePageDataResult, nextjsRoutingProps));

  // Check for early return (redirect/notFound)
  if ('redirect' in mergedResult || 'notFound' in mergedResult) {
    return mergedResult;
  }

  // Validate the merged props have all required properties
  if (!isValidSameRouteProps(mergedResult.props)) {
    throw new Error('Invalid same route props structure');
  }

  // -- TODO: persist activity

  // const mergedProps = await mergedResult.props;

  // // Type-safe props validation AFTER skipSSR is properly set
  // if (!isValidSameRouteProps(mergedProps)) {
  //   throw new Error('Invalid same route props structure');
  // }

  // await addActivity(context, getActivityAction(mergedProps));
  return mergedResult;
}
