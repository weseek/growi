import { AllLang } from '@growi/core';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { SSRConfig } from 'next-i18next';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import { getLangAtServerSide } from '~/pages/utils/locale';

export const NEXT_JS_ROUTING_PAGE = '[[...path]]';

// Shared helper function to create i18n config with proper configuration
export async function createNextI18NextConfig(
    context: GetServerSidePropsContext,
    namespacesRequired?: string[],
    preloadAllLang = false,
): Promise<SSRConfig> {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');

  // Import configuration to fix the error
  const nextI18NextConfig = await import('^/config/next-i18next.config');

  // Determine language from request context
  const req: CrowiRequest = context.req as CrowiRequest;
  const lang = getLangAtServerSide(req);

  // Prepare namespaces with commons as default
  const namespaces = ['commons'];
  if (namespacesRequired != null) {
    namespaces.push(...namespacesRequired);
  }
  else {
    // TODO: deprecate 'translation.json' in the future
    namespaces.push('translation');
  }

  // Call serverSideTranslations with proper configuration
  return serverSideTranslations(
    lang,
    namespaces,
    nextI18NextConfig,
    preloadAllLang ? AllLang : false,
  );
}

// Common user and redirect handling
type RedirectResult = { redirect: { permanent: boolean; destination: string } };
export function handleUserAndRedirects(context: GetServerSidePropsContext, props: Record<string, unknown>): RedirectResult | null {
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

// Helper function to handle page data result with improved type safety
export function handlePageDataResult<T, U>(
    result: GetServerSidePropsResult<T>,
    currentProps: U,
): GetServerSidePropsResult<U & T> {
  if ('redirect' in result) {
    return result as GetServerSidePropsResult<U & T>;
  }
  if ('notFound' in result) {
    return result as GetServerSidePropsResult<U & T>;
  }

  // Ensure result.props exists and is not a Promise
  if (!('props' in result) || !result.props) {
    throw new Error('Invalid page data result - missing props');
  }

  // Type-safe props merging
  return {
    props: {
      ...currentProps,
      ...result.props,
    } as U & T,
  };
}

// Type-safe GetServerSidePropsResult merger with overloads
export function mergeGetServerSidePropsResults<T1, T2>(
    result1: GetServerSidePropsResult<T1>,
    result2: GetServerSidePropsResult<T2>,
): GetServerSidePropsResult<T1 & T2>;
export function mergeGetServerSidePropsResults<T1, T2, T3, T4>(
    result1: GetServerSidePropsResult<T1>,
    result2: GetServerSidePropsResult<T2>,
    result3: GetServerSidePropsResult<T3>,
    result4: GetServerSidePropsResult<T4>,
): GetServerSidePropsResult<T1 & T2 & T3 & T4>;
export function mergeGetServerSidePropsResults<T1, T2, T3, T4>(
    result1: GetServerSidePropsResult<T1>,
    result2: GetServerSidePropsResult<T2>,
    result3?: GetServerSidePropsResult<T3>,
    result4?: GetServerSidePropsResult<T4>,
): GetServerSidePropsResult<T1 & T2> | GetServerSidePropsResult<T1 & T2 & T3 & T4> {
  // Handle 2-argument case
  if (result3 === undefined && result4 === undefined) {
    if ('redirect' in result1) return result1;
    if ('redirect' in result2) return result2;
    if ('notFound' in result1) return result1;
    if ('notFound' in result2) return result2;

    if (!('props' in result1) || !('props' in result2)) {
      throw new Error('Invalid GetServerSidePropsResult - missing props');
    }

    return {
      props: {
        ...result1.props,
        ...result2.props,
      } as T1 & T2,
    };
  }

  // Handle 4-argument case
  if (result3 === undefined || result4 === undefined) {
    throw new Error('All 4 arguments required for 4-way merge');
  }

  if ('redirect' in result1) return result1;
  if ('redirect' in result2) return result2;
  if ('redirect' in result3) return result3;
  if ('redirect' in result4) return result4;

  if ('notFound' in result1) return result1;
  if ('notFound' in result2) return result2;
  if ('notFound' in result3) return result3;
  if ('notFound' in result4) return result4;

  if (!('props' in result1) || !('props' in result2)
      || !('props' in result3) || !('props' in result4)) {
    throw new Error('Invalid GetServerSidePropsResult - missing props');
  }

  return {
    props: {
      ...result1.props,
      ...result2.props,
      ...result3.props,
      ...result4.props,
    } as T1 & T2 & T3 & T4,
  };
}

// Type-safe property extraction helper
export function extractTypedProps<T>(result: unknown, errorMessage: string): T {
  if (typeof result !== 'object' || result === null || !('props' in result)) {
    throw new Error(errorMessage);
  }
  return (result as { props: T }).props;
}
