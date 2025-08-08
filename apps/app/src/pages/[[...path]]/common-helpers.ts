import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import { getServerSideCommonInitialProps } from '~/pages/utils/commons';
import { getServerSidePageTitleCustomizationProps } from '~/pages/utils/page-title-customization';
import { getServerSideUserUISettingsProps } from '~/pages/utils/user-ui-settings';

import { getServerSideConfigurationProps } from './configuration-props';

export const NEXT_JS_ROUTING_PAGE = '[[...path]]';

// Private helper function to create i18n config
export async function createNextI18NextConfig(context: GetServerSidePropsContext, namespacesRequired?: string[]) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  const lang = 'en_US';
  const namespaces = ['commons', ...(namespacesRequired ?? ['translation'])];
  return serverSideTranslations(lang, namespaces);
}

// Common props collection helper
export async function collectProps(context: GetServerSidePropsContext) {
  const propResults = await Promise.all([
    getServerSideCommonInitialProps(context),
    getServerSidePageTitleCustomizationProps(context),
    getServerSideUserUISettingsProps(context),
    getServerSideConfigurationProps(context),
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
export function handleUserAndRedirects(context: GetServerSidePropsContext, props: Record<string, unknown>) {
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

// Helper function to handle page data result - returns early return result or merged props
export function handlePageDataResult<T>(
    result: GetServerSidePropsResult<T>,
    currentProps: Record<string, unknown>,
): { earlyReturn: GetServerSidePropsResult<unknown> } | { mergedProps: Record<string, unknown> } {
  if ('redirect' in result) {
    return { earlyReturn: result };
  }
  if ('notFound' in result) {
    return { earlyReturn: result };
  }

  // Return new merged props without side effects
  return {
    mergedProps: {
      ...currentProps,
      ...result.props,
    },
  };
}
