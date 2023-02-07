import type { ColorScheme, IUser, IUserHasId } from '@growi/core';
import {
  DevidedPagePath, Lang, AllLang,
} from '@growi/core';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { SSRConfig, UserConfig } from 'next-i18next';

import * as nextI18NextConfig from '^/config/next-i18next.config';

import type { CrowiRequest } from '~/interfaces/crowi-request';

export type CommonProps = {
  namespacesRequired: string[], // i18next
  currentPathname: string,
  appTitle: string,
  siteUrl: string,
  confidential: string,
  customTitleTemplate: string,
  csrfToken: string,
  isContainerFluid: boolean,
  growiVersion: string,
  isMaintenanceMode: boolean,
  redirectDestination: string | null,
  isDefaultLogo: boolean,
  currentUser?: IUserHasId,
  forcedColorScheme?: ColorScheme,
} & Partial<SSRConfig>;

// eslint-disable-next-line max-len
export const getServerSideCommonProps: GetServerSideProps<CommonProps> = async(context: GetServerSidePropsContext) => {

  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { crowi, user } = req;
  const {
    appService, configManager, customizeService, attachmentService,
  } = crowi;

  const url = new URL(context.resolvedUrl, 'http://example.com');
  const currentPathname = decodeURIComponent(url.pathname);

  const isMaintenanceMode = appService.isMaintenanceMode();

  let currentUser;
  if (user != null) {
    currentUser = user.toObject();
  }

  // Redirect destination for page transition by next/link
  let redirectDestination: string | null = null;
  if (!crowi.aclService.isGuestAllowedToRead() && currentUser == null) {
    redirectDestination = '/login';
  }
  else if (!isMaintenanceMode && currentPathname === '/maintenance') {
    redirectDestination = '/';
  }
  else if (isMaintenanceMode && !currentPathname.match('/admin/*') && !(currentPathname === '/maintenance')) {
    redirectDestination = '/maintenance';
  }
  else {
    redirectDestination = null;
  }

  const isCustomizedLogoUploaded = await attachmentService.isBrandLogoExist();
  const isDefaultLogo = crowi.configManager.getConfig('crowi', 'customize:isDefaultLogo') || !isCustomizedLogoUploaded;
  const forcedColorScheme = crowi.customizeService.forcedColorScheme;

  const props: CommonProps = {
    namespacesRequired: ['translation'],
    currentPathname,
    appTitle: appService.getAppTitle(),
    siteUrl: configManager.getConfig('crowi', 'app:siteUrl'), // DON'T USE appService.getSiteUrl()
    confidential: appService.getAppConfidential() || '',
    customTitleTemplate: customizeService.customTitleTemplate,
    csrfToken: req.csrfToken(),
    isContainerFluid: configManager.getConfig('crowi', 'customize:isContainerFluid') ?? false,
    growiVersion: crowi.version,
    isMaintenanceMode,
    redirectDestination,
    currentUser,
    isDefaultLogo,
    forcedColorScheme,
  };

  return { props };
};

export const getNextI18NextConfig = async(
    // 'serverSideTranslations' method should be given from Next.js Page
    //  because importing it in this file causes https://github.com/isaachinman/next-i18next/issues/1545
    serverSideTranslations: (
      initialLocale: string, namespacesRequired?: string[] | undefined, configOverride?: UserConfig | null, extraLocales?: string[] | false
    ) => Promise<SSRConfig>,
    context: GetServerSidePropsContext, namespacesRequired?: string[] | undefined, preloadAllLang = false,
): Promise<SSRConfig> => {

  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi, user, headers } = req;
  const { configManager } = crowi;

  // detect locale from browser accept language
  const detectLocaleFromBrowserAcceptLanguage = () => {
    // get the header accept-language
    // ex. "ja,ar-SA;q=0.8,en;q=0.6,en-CA;q=0.4,en-US;q=0.2"
    const acceptLanguages = headers['accept-language'];

    if (acceptLanguages == null) {
      return Lang.en_US;
    }

    // 1. trim blank spaces.
    // 2. separate by ,.
    // 3. if "lang;q=x", then { 'x', 'lang' } to add to the associative array.
    //    if "lang" has no weight x (";q=x"), add it with key = 1.
    // ex. {'1': 'ja','0.8': 'ar-SA','0.6': 'en','0.4': 'en-CA','0.2': 'en-US'}
    const acceptLanguagesDict = acceptLanguages
      .replace(/\s+/g, '')
      .split(',')
      .map(item => item.split(/\s*;\s*q\s*=\s*/))
      .reduce((acc, [key, value = '1']) => {
        acc[value] = key;
        return acc;
      }, {});

    // create an array of sorted languages in descending order.
    // ex. [ 'ja', 'ar-SA', 'en', 'en-CA', 'en-US' ]
    const sortedAcceptLanguagesArray = Object.keys(acceptLanguagesDict)
      .sort((a, b) => b.localeCompare(a))
      .map(item => acceptLanguagesDict[item]);

    // it return the first language that matches 'en', 'ja' or 'zh.
    // if no matching language is found, it returns Lang.en_US as a default.
    for (const lang of sortedAcceptLanguagesArray) {
      if (lang.includes('en')) return Lang.en_US;
      if (lang.includes('ja')) return Lang.ja_JP;
      if (lang.includes('zh')) return Lang.zh_CN;
    }
    return Lang.en_US;
  };

  const detectLocale = detectLocaleFromBrowserAcceptLanguage();

  // determine language
  const locale = user == null ? detectLocale
    : (user.lang ?? configManager.getConfig('crowi', 'app:globalLang') as Lang ?? Lang.en_US);

  const namespaces = ['commons'];
  if (namespacesRequired != null) {
    namespaces.push(...namespacesRequired);
  }
  // TODO: deprecate 'translation.json' in the future
  else {
    namespaces.push('translation');
  }

  return serverSideTranslations(locale, namespaces, nextI18NextConfig, preloadAllLang ? AllLang : false);
};

/**
 * Generate whole title string for the specified title
 * @param props
 * @param title
 */
export const generateCustomTitle = (props: CommonProps, title: string): string => {
  return props.customTitleTemplate
    .replace('{{sitename}}', props.appTitle)
    .replace('{{pagepath}}', title)
    .replace('{{pagename}}', title);
};

/**
 * Generate whole title string for the specified page path
 * @param props
 * @param pagePath
 */
export const generateCustomTitleForPage = (props: CommonProps, pagePath: string): string => {
  const dPagePath = new DevidedPagePath(pagePath, true, true);

  return props.customTitleTemplate
    .replace('{{sitename}}', props.appTitle)
    .replace('{{pagepath}}', pagePath)
    .replace('{{pagename}}', dPagePath.latter);
};
