import type { ColorScheme, IUserHasId } from '@growi/core';
import { atom, useAtomValue } from 'jotai';
import type { SupportedActionType } from '~/interfaces/activity';

/**
 * CSRF Token atom
 */
const csrfTokenAtom = atom<string>('');
/**
 * CSRF Token atom setter
 */
export const useCsrfToken = () => useAtomValue(csrfTokenAtom);

/**
 * App current pathname atom
 */
const currentPathnameAtom = atom<string>('');
/**
 * App current pathname atom setter
 */
export const useCurrentPathname = () => useAtomValue(currentPathnameAtom);

/**
 * Current User atom
 */
const currentUserAtom = atom<IUserHasId | undefined>();
/**
 * Current user atom getter
 */
export const currentUserAtomGetter = atom((get) => get(currentUserAtom));
/**
 * Current User atom setter
 */
export const useCurrentUser = () => useAtomValue(currentUserAtom);

/**
 * App Title atom
 */
const appTitleAtom = atom<string>('');
/**
 * App Title atom setter
 */
export const useAppTitle = () => useAtomValue(appTitleAtom);

/**
 * Custom Title Template atom
 */
const customTitleTemplateAtom = atom<string>('');
/**
 * Custom Title Template atom setter
 */
export const useCustomTitleTemplate = () =>
  useAtomValue(customTitleTemplateAtom);

/**
 * Site URL atom
 */
const siteUrlAtom = atom<string | undefined>(undefined);
/**
 * Site URL atom setter
 */
export const useSiteUrl = () => useAtomValue(siteUrlAtom);

/**
 * Site URL atom
 */
const siteUrlWithEmptyValueWarnAtom = atom<string>('');
/**
 * Site URL with empty value warning atom setter
 */
export const useSiteUrlWithEmptyValueWarn = () =>
  useAtomValue(siteUrlWithEmptyValueWarnAtom);

/**
 * Confidential atom
 */
const confidentialAtom = atom<string>('');
/**
 * Confidential atom setter
 */
export const useConfidential = () => useAtomValue(confidentialAtom);

/**
 * GROWI Version atom
 */
const growiVersionAtom = atom<string>('');
/**
 * GROWI Version atom setter
 */
export const useGrowiVersion = () => useAtomValue(growiVersionAtom);

/**
 * Maintenance Mode atom
 */
const isMaintenanceModeAtom = atom<boolean>(false);
/**
 * Maintenance Mode atom setter
 */
export const useIsMaintenanceMode = () => useAtomValue(isMaintenanceModeAtom);

/**
 * Default Logo atom
 */
const isDefaultLogoAtom = atom<boolean>(true);
/**
 * Default Logo atom setter
 */
export const useIsDefaultLogo = () => useAtomValue(isDefaultLogoAtom);

/**
 * Customize Title
 */
const customizeTitleAtom = atom<string | undefined>(undefined);
/**
 * Customize Title atom setter
 */
export const useCustomizeTitle = () => useAtomValue(customizeTitleAtom);

/**
 * Is Customized Logo Uploaded
 */
const isCustomizedLogoUploadedAtom = atom<boolean>(false);
/**
 * Is Customized Logo Uploaded atom setter
 */
export const useIsCustomizedLogoUploaded = () =>
  useAtomValue(isCustomizedLogoUploadedAtom);

/**
 * GROWI Cloud URI atom
 */
const growiCloudUriAtom = atom<string | undefined>(undefined);
/**
 * GROWI Cloud URI atom getter
 */
export const growiCloudUriAtomGetter = atom((get) => get(growiCloudUriAtom));
/**
 * GROWI Cloud URI atom setter
 */
export const useGrowiCloudUri = () => useAtomValue(growiCloudUriAtom);

/**
 * GROWI Cloud App ID atom
 */
const growiAppIdForGrowiCloudAtom = atom<number | undefined>(undefined);
/**
 * GROWI Cloud App ID atom setter
 */
export const useGrowiAppIdForGrowiCloud = () =>
  useAtomValue(growiAppIdForGrowiCloudAtom);

/**
 * Forced Color Scheme atom
 */
const forcedColorSchemeAtom = atom<ColorScheme | undefined>(undefined);
/**
 * Forced Color Scheme atom setter
 */
export const useForcedColorScheme = () => useAtomValue(forcedColorSchemeAtom);

/**
 * Audit Log Enabled atom
 */
const auditLogEnabledAtom = atom<boolean>(false);
/**
 * Audit Log Enabled atom setter
 */
export const useAuditLogEnabled = () => useAtomValue(auditLogEnabledAtom);

/**
 * Activity Expiration Seconds atom
 */
const activityExpirationSecondsAtom = atom<number>(0);
/**
 * Activity Expiration Seconds atom setter
 */
export const useActivityExpirationSeconds = () =>
  useAtomValue(activityExpirationSecondsAtom);

/**
 * Audit Log Available Actions atom
 */
const auditLogAvailableActionsAtom = atom<SupportedActionType[]>([]);
/**
 * Audit Log Available Actions atom setter
 */
export const useAuditLogAvailableActions = () =>
  useAtomValue(auditLogAvailableActionsAtom);

export const _atomsForHydration = {
  csrfTokenAtom,
  currentPathnameAtom,
  currentUserAtom,
  appTitleAtom,
  customTitleTemplateAtom,
  siteUrlAtom,
  siteUrlWithEmptyValueWarnAtom,
  confidentialAtom,
  growiVersionAtom,
  isMaintenanceModeAtom,
  isDefaultLogoAtom,
  customizeTitleAtom,
  isCustomizedLogoUploadedAtom,
  growiCloudUriAtom,
  growiAppIdForGrowiCloudAtom,
  forcedColorSchemeAtom,
  auditLogEnabledAtom,
  activityExpirationSecondsAtom,
  auditLogAvailableActionsAtom,
};
