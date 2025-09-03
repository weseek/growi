import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import type { CommonInitialProps, CommonEachProps } from '../../common-props';
import { getServerSideCommonInitialProps, getServerSideCommonEachProps, getServerSideI18nProps } from '../../common-props';
import { mergeGetServerSidePropsResults } from '../../utils/server-side-props';

/** Base admin page props (allowed or forbidden). */
export type AdminCommonProps = CommonInitialProps & CommonEachProps & {
  isAccessDeniedForNonAdminUser: boolean;
};

/**
 * Build common admin SSR props (merges common initial/each/i18n and computes admin flag).
 * Returns redirect / notFound as-is.
 */
export const getServerSideAdminCommonProps: GetServerSideProps<AdminCommonProps> = async(context: GetServerSidePropsContext) => {
  //
  // STAGE 1
  //

  const commonEachPropsResult = await getServerSideCommonEachProps(context);
  // Handle early return cases (redirect/notFound)
  if ('redirect' in commonEachPropsResult || 'notFound' in commonEachPropsResult) {
    return commonEachPropsResult;
  }
  const commonEachProps = await commonEachPropsResult.props;
  const { currentUser } = commonEachProps;

  const isAccessDeniedForNonAdminUser = (currentUser == null || !currentUser.admin);

  //
  // STAGE 2
  //
  const [
    commonInitialResult,
    i18nResult,
  ] = await Promise.all([
    getServerSideCommonInitialProps(context),
    getServerSideI18nProps(context, ['admin']),
  ]);

  return mergeGetServerSidePropsResults(commonInitialResult,
    mergeGetServerSidePropsResults(commonEachPropsResult,
      mergeGetServerSidePropsResults(i18nResult, { props: { isAccessDeniedForNonAdminUser } })));
};
