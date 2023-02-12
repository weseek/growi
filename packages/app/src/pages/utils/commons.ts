import type { IncomingHttpHeaders } from 'http';

import type { ColorScheme, IUserHasId } from '@growi/core';
import {
  DevidedPagePath, Lang, AllLang, acceptLangMap,
} from '@growi/core';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import type { SSRConfig, UserConfig } from 'next-i18next';

import * as nextI18NextConfig from '^/config/next-i18next.config';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { ISidebarConfig } from '~/interfaces/sidebar-config';
import type { IUserUISettings } from '~/interfaces/user-ui-settings';
import {
  useCurrentProductNavWidth, useCurrentSidebarContents, usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser, useSidebarCollapsed,
} from '~/stores/ui';

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

/**
 * It return the first language that matches acceptLangMap keys from sorted accept languages array
 * @param sortedAcceptLanguagesArray
 */
const getPreferredLanguage = (sortedAcceptLanguagesArray: string[]): Lang => {
  for (const lang of sortedAcceptLanguagesArray) {
    const matchingLang = Object.keys(acceptLangMap).find(key => lang.includes(key));
    if (matchingLang) return acceptLangMap[matchingLang];
  }
  return nextI18NextConfig.defalutLang;
};

/**
  * Detect locale from browser accept language
  * @param headers
  */
const detectLocaleFromBrowserAcceptLanguage = (headers: IncomingHttpHeaders) => {
  // 1. get the header accept-language
  // ex. "ja,ar-SA;q=0.8,en;q=0.6,en-CA;q=0.4,en-US;q=0.2"
  const acceptLanguages = headers['accept-language'];

  if (acceptLanguages == null) {
    return nextI18NextConfig.defalutLang;
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

  // 1. create an array of sorted languages in descending order.
  // ex. [ 'ja', 'ar-SA', 'en', 'en-CA', 'en-US' ]
  const sortedAcceptLanguagesArray = Object.keys(acceptLanguagesDict)
    .sort((x, y) => y.localeCompare(x))
    .map(item => acceptLanguagesDict[item]);

  return getPreferredLanguage(sortedAcceptLanguagesArray);
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

  // determine language
  const locale = user == null ? detectLocaleFromBrowserAcceptLanguage(headers)
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

export const useInitSidebarConfig = (sidebarConfig: ISidebarConfig, userUISettings?: IUserUISettings): void => {
  // UserUISettings
  usePreferDrawerModeByUser(userUISettings?.preferDrawerModeByUser ?? sidebarConfig.isSidebarDrawerMode);
  usePreferDrawerModeOnEditByUser(userUISettings?.preferDrawerModeOnEditByUser);
  useSidebarCollapsed(userUISettings?.isSidebarCollapsed ?? sidebarConfig.isSidebarClosedAtDockMode);
  useCurrentSidebarContents(userUISettings?.currentSidebarContents);
  useCurrentProductNavWidth(userUISettings?.currentProductNavWidth);
};
