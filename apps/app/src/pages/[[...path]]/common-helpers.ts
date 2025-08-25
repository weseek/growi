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

// Type-safe GetServerSidePropsResult merger with overloads
export function mergeGetServerSidePropsResults<T1, T2>(
    result1: GetServerSidePropsResult<T1>,
    result2: GetServerSidePropsResult<T2>,
): GetServerSidePropsResult<T1 & T2>;
export function mergeGetServerSidePropsResults<T1, T2, T3>(
    result1: GetServerSidePropsResult<T1>,
    result2: GetServerSidePropsResult<T2>,
    result3: GetServerSidePropsResult<T3>,
): GetServerSidePropsResult<T1 & T2 & T3>;
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
): GetServerSidePropsResult<T1 & T2> | GetServerSidePropsResult<T1 & T2 & T3> | GetServerSidePropsResult<T1 & T2 & T3 & T4> {
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

  // Handle 3-argument case
  if (result4 === undefined && result3 !== undefined) {
    if ('redirect' in result1) return result1;
    if ('redirect' in result2) return result2;
    if ('redirect' in result3) return result3;
    if ('notFound' in result1) return result1;
    if ('notFound' in result2) return result2;
    if ('notFound' in result3) return result3;

    if (!('props' in result1) || !('props' in result2) || !('props' in result3)) {
      throw new Error('Invalid GetServerSidePropsResult - missing props');
    }

    return {
      props: {
        ...result1.props,
        ...result2.props,
        ...result3.props,
      } as T1 & T2 & T3,
    };
  }

  // Handle 4-argument case
  if (result3 !== undefined && result4 !== undefined) {
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

  throw new Error('Invalid arguments for mergeGetServerSidePropsResults');
}

// Type-safe property extraction helper
export function extractTypedProps<T>(result: unknown, errorMessage: string): T {
  if (typeof result !== 'object' || result === null || !('props' in result)) {
    throw new Error(errorMessage);
  }
  return (result as { props: T }).props;
}
