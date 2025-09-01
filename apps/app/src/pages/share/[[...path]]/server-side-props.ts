import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import type { CommonEachProps } from '../../common-props';
import {
  getServerSideI18nProps, getServerSideCommonInitialProps, getServerSideCommonEachProps,
} from '../../common-props';
import type { GeneralPageInitialProps } from '../../general-page';
import {
  getServerSideConfigurationProps,
  getServerSideRendererConfigProps,
  getActivityAction, isValidInitialAndSameRouteProps,
} from '../../general-page';
import { addActivity } from '../../utils/activity';
import { mergeGetServerSidePropsResults } from '../../utils/server-side-props';

import { NEXT_JS_ROUTING_PAGE } from './consts';
import { getPageDataForInitial } from './page-data-props';
import type { ShareLinkInitialProps } from './types';


const nextjsRoutingProps = {
  props: {
    nextjsRoutingPage: NEXT_JS_ROUTING_PAGE,
  },
};

const basisProps = {
  props: {
    isNotCreatable: true,
    isForbidden: false,
    isIdenticalPathPage: false,
  },
};

export async function getServerSidePropsForInitial(context: GetServerSidePropsContext):
    Promise<GetServerSidePropsResult<GeneralPageInitialProps & ShareLinkInitialProps & CommonEachProps>> {

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
    serverConfigResult,
    rendererConfigResult,
    i18nPropsResult,
    pageDataResult,
  ] = await Promise.all([
    getServerSideCommonInitialProps(context),
    getServerSideConfigurationProps(context),
    getServerSideRendererConfigProps(context),
    getServerSideI18nProps(context, ['translation']),
    getPageDataForInitial(context),
  ]);

  // Merge all results in a type-safe manner (using sequential merging)
  const mergedResult = mergeGetServerSidePropsResults(commonEachPropsResult,
    mergeGetServerSidePropsResults(commonInitialResult,
      mergeGetServerSidePropsResults(serverConfigResult,
        mergeGetServerSidePropsResults(rendererConfigResult,
          mergeGetServerSidePropsResults(i18nPropsResult,
            mergeGetServerSidePropsResults(pageDataResult,
              mergeGetServerSidePropsResults(nextjsRoutingProps, basisProps)))))));

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

export async function getServerSidePropsForSameRoute(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<CommonEachProps>> {
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

  // Merge results in a type-safe manner
  const mergedResult = mergeGetServerSidePropsResults(commonEachPropsResult, nextjsRoutingProps);

  // -- TODO: persist activity

  // const mergedProps = await mergedResult.props;

  // // Type-safe props validation AFTER skipSSR is properly set
  // if (!isValidSameRouteProps(mergedProps)) {
  //   throw new Error('Invalid same route props structure');
  // }

  // await addActivity(context, getActivityAction(mergedProps));
  return mergedResult;
}
