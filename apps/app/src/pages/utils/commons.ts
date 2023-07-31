import type { ColorScheme, IUserHasId } from '@growi/core';
import {
  DevidedPagePath, Lang, AllLang, isServer,
} from '@growi/core';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import type { SSRConfig, UserConfig } from 'next-i18next';

import * as nextI18NextConfig from '^/config/next-i18next.config';

import { detectLocaleFromBrowserAcceptLanguage } from '~/client/util/locale-utils';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { ISidebarConfig } from '~/interfaces/sidebar-config';
import type { IUserUISettings } from '~/interfaces/user-ui-settings';
import type { PageDocument } from '~/server/models/page';
import type { UserUISettingsDocument } from '~/server/models/user-ui-settings';
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
  growiCloudUri: string,
  currentUser?: IUserHasId,
  forcedColorScheme?: ColorScheme,
  sidebarConfig: ISidebarConfig,
  userUISettings?: IUserUISettings
} & Partial<SSRConfig>;

// eslint-disable-next-line max-len
export const getServerSideCommonProps: GetServerSideProps<CommonProps> = async(context: GetServerSidePropsContext) => {
  const getModelSafely = await import('~/server/util/mongoose-utils').then(mod => mod.getModelSafely);

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

  // retrieve UserUISett ings
  const UserUISettings = getModelSafely<UserUISettingsDocument>('UserUISettings');
  const userUISettings = user != null && UserUISettings != null
    ? await UserUISettings.findOne({ user: user._id }).exec()
    : req.session.uiSettings; // for guests

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
    growiCloudUri: configManager.getConfig('crowi', 'app:growiCloudUri'),
    sidebarConfig: {
      isSidebarDrawerMode: configManager.getConfig('crowi', 'customize:isSidebarDrawerMode'),
      isSidebarClosedAtDockMode: configManager.getConfig('crowi', 'customize:isSidebarClosedAtDockMode'),
    },
    userUISettings: userUISettings?.toObject?.() ?? userUISettings,
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


export const skipSSR = async(page: PageDocument): Promise<boolean> => {
  if (!isServer()) {
    throw new Error('This method is not available on the client-side');
  }

  // page document only stores the bodyLength of the latest revision
  if (!page.isLatestRevision() || page.latestRevisionBodyLength == null) {
    return true;
  }

  const configManager = await import('~/server/service/config-manager')
    .then(async(mod) => {
      if (!mod.configManager.isInitialized) {
        await mod.configManager.loadConfigs();
      }
      return mod.configManager;
    });
  const ssrMaxRevisionBodyLength = configManager.getConfig('crowi', 'app:ssrMaxRevisionBodyLength');
  if (ssrMaxRevisionBodyLength < page.latestRevisionBodyLength) {
    return true;
  }

  return false;
};
