import { AllLang } from '@growi/core';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { SSRConfig } from 'next-i18next';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import { getLangAtServerSide } from '~/pages/utils/locale';

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

// Type-safe GetServerSidePropsResult merger for two results
export function mergeGetServerSidePropsResults<T1, T2>(
    result1: GetServerSidePropsResult<T1>,
    result2: GetServerSidePropsResult<T2>,
): GetServerSidePropsResult<T1 & T2> {
  // Check for redirect responses (return the first one found)
  if ('redirect' in result1) return result1;
  if ('redirect' in result2) return result2;

  // Check for notFound responses (return the first one found)
  if ('notFound' in result1) return result1;
  if ('notFound' in result2) return result2;

  // Both results must have props for successful merge
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

// Type-safe property extraction helper
export function extractTypedProps<T>(result: unknown, errorMessage: string): T {
  if (typeof result !== 'object' || result === null || !('props' in result)) {
    throw new Error(errorMessage);
  }
  return (result as { props: T }).props;
}
