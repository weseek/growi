import { DevidedPagePath, Lang } from '@growi/core';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { SSRConfig, UserConfig } from 'next-i18next';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { GrowiThemes } from '~/interfaces/theme';

import * as nextI18NextConfig from '../next-i18next.config';

export type CommonProps = {
  namespacesRequired: string[], // i18next
  currentPathname: string,
  appTitle: string,
  siteUrl: string,
  confidential: string,
  theme: GrowiThemes,
  customTitleTemplate: string,
  csrfToken: string,
  growiVersion: string,
} & Partial<SSRConfig>;

// eslint-disable-next-line max-len
export const getServerSideCommonProps: GetServerSideProps<CommonProps> = async(context: GetServerSidePropsContext) => {

  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, configManager, customizeService,
  } = crowi;

  const url = new URL(context.resolvedUrl, 'http://example.com');
  const currentPathname = decodeURI(url.pathname);

  const props: CommonProps = {
    namespacesRequired: ['translation'],
    currentPathname,
    appTitle: appService.getAppTitle(),
    siteUrl: appService.getSiteUrl(),
    confidential: appService.getAppConfidential() || '',
    theme: configManager.getConfig('crowi', 'customize:theme'),
    customTitleTemplate: customizeService.customTitleTemplate,
    csrfToken: req.csrfToken(),
    growiVersion: crowi.version,
  };

  return { props };
};

export const getNextI18NextConfig = async(
    // 'serverSideTranslations' method should be given from Next.js Page
    //  because importing it in this file causes https://github.com/isaachinman/next-i18next/issues/1545
    serverSideTranslations: (initialLocale: string, namespacesRequired?: string[] | undefined, configOverride?: UserConfig | null) => Promise<SSRConfig>,
    context: GetServerSidePropsContext, namespacesRequired?: string[] | undefined,
): Promise<SSRConfig> => {

  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi, user } = req;
  const { configManager } = crowi;

  // determine language
  const locale = user?.lang
    ?? configManager.getConfig('crowi', 'app:globalLang') as Lang
    ?? Lang.en_US;

  return serverSideTranslations(locale, namespacesRequired ?? ['translation'], nextI18NextConfig);
};

/**
 * Generate whole title string for the specified title
 * @param props
 * @param title
 */
export const useCustomTitle = (props: CommonProps, title: string): string => {
  return props.customTitleTemplate
    .replace('{{sitename}}', props.appTitle)
    .replace('{{page}}', title)
    .replace('{{pagepath}}', title)
    .replace('{{pagename}}', title);
};

/**
 * Generate whole title string for the specified page path
 * @param props
 * @param pagePath
 */
export const useCustomTitleForPage = (props: CommonProps, pagePath: string): string => {
  const dPagePath = new DevidedPagePath(pagePath, true, true);

  return props.customTitleTemplate
    .replace('{{sitename}}', props.appTitle)
    .replace('{{pagepath}}', pagePath)
    .replace('{{page}}', dPagePath.latter) // for backward compatibility
    .replace('{{pagename}}', dPagePath.latter);
};
