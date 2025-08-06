import { AllLang } from '@growi/core';
import { isServer } from '@growi/core/dist/utils';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { SSRConfig, UserConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import * as nextI18NextConfig from '^/config/next-i18next.config';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { PageDocument } from '~/server/models/page';

import { getLangAtServerSide } from './locale';


const skipSSR = async(page: PageDocument, ssrMaxRevisionBodyLength: number): Promise<boolean> => {
  if (!isServer()) {
    throw new Error('This method is not available on the client-side');
  }

  const latestRevisionBodyLength = await page.getLatestRevisionBodyLength();

  if (latestRevisionBodyLength == null) {
    return true;
  }

  return ssrMaxRevisionBodyLength < latestRevisionBodyLength;
};

const getNextI18NextConfig = async(
    // 'serverSideTranslations' method should be given from Next.js Page
    //  because importing it in this file causes https://github.com/isaachinman/next-i18next/issues/1545
    serverSideTranslations: (
      initialLocale: string, namespacesRequired?: string[] | undefined, configOverride?: UserConfig | null, extraLocales?: string[] | false
    ) => Promise<SSRConfig>,
    context: GetServerSidePropsContext, namespacesRequired?: string[] | undefined, preloadAllLang = false,
): Promise<SSRConfig> => {

  // determine language
  const req: CrowiRequest = context.req as CrowiRequest;
  const lang = getLangAtServerSide(req);

  const namespaces = ['commons'];
  if (namespacesRequired != null) {
    namespaces.push(...namespacesRequired);
  }
  // TODO: deprecate 'translation.json' in the future
  else {
    namespaces.push('translation');
  }

  // The first argument must be a language code with an underscore, such as en_US
  return serverSideTranslations(lang, namespaces, nextI18NextConfig, preloadAllLang ? AllLang : false);
};

export type SSRProps = SSRConfig & {
  skipSSR: boolean;
}

export const getServerSideSSRProps = async(
    context: GetServerSidePropsContext,
    page: PageDocument,
    namespacesRequired?: string[] | undefined,
): Promise<GetServerSidePropsResult<SSRProps>> => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { configManager } = crowi;

  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);

  const ssrMaxRevisionBodyLength = configManager.getConfig('app:ssrMaxRevisionBodyLength');

  return {
    props: {
      _nextI18Next: nextI18NextConfig._nextI18Next,
      skipSSR: await skipSSR(page, ssrMaxRevisionBodyLength),
    },
  };
};
