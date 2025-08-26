import type { ColorScheme, IUserHasId } from '@growi/core';
import { atom, useAtom } from 'jotai';

import type { UseAtom } from '../helper';

// CSRF Token atom (no persistence needed as it's server-provided)
export const csrfTokenAtom = atom<string>('');
export const useCsrfToken = (): UseAtom<typeof csrfTokenAtom> => {
  return useAtom(csrfTokenAtom);
};

// App current pathname atom (no persistence needed as it's server-provided)
export const currentPathnameAtom = atom<string>('');
export const useCurrentPathname = (): UseAtom<typeof currentPathnameAtom> => {
  return useAtom(currentPathnameAtom);
};

// Current User atom (no persistence needed as it's server-provided)
export const currentUserAtom = atom<IUserHasId | undefined>();
export const useCurrentUser = (): UseAtom<typeof currentUserAtom> => {
  return useAtom(currentUserAtom);
};

// App Title atom (no persistence needed as it's server-provided)
export const appTitleAtom = atom<string>('');
export const useAppTitle = (): UseAtom<typeof appTitleAtom> => {
  return useAtom(appTitleAtom);
};

// Custom Title Template atom (no persistence needed as it's server-provided)
export const customTitleTemplateAtom = atom<string>('');
export const useCustomTitleTemplate = (): UseAtom<typeof customTitleTemplateAtom> => {
  return useAtom(customTitleTemplateAtom);
};

// Site URL atom (no persistence needed as it's server-provided)
export const siteUrlAtom = atom<string | undefined>(undefined);
export const useSiteUrl = (): UseAtom<typeof siteUrlAtom> => {
  return useAtom(siteUrlAtom);
};

// Confidential atom (no persistence needed as it's server-provided)
export const confidentialAtom = atom<string>('');
export const useConfidential = (): UseAtom<typeof confidentialAtom> => {
  return useAtom(confidentialAtom);
};

// GROWI Version atom (no persistence needed as it's server-provided)
export const growiVersionAtom = atom<string>('');
export const useGrowiVersion = (): UseAtom<typeof growiVersionAtom> => {
  return useAtom(growiVersionAtom);
};

// Maintenance Mode atom (no persistence needed as it's server-provided)
export const isMaintenanceModeAtom = atom<boolean>(false);
export const useIsMaintenanceMode = (): UseAtom<typeof isMaintenanceModeAtom> => {
  return useAtom(isMaintenanceModeAtom);
};

// Default Logo atom (no persistence needed as it's server-provided)
export const isDefaultLogoAtom = atom<boolean>(true);
export const useIsDefaultLogo = (): UseAtom<typeof isDefaultLogoAtom> => {
  return useAtom(isDefaultLogoAtom);
};

// GROWI Cloud URI atom (no persistence needed as it's server-provided)
export const growiCloudUriAtom = atom<string | undefined>(undefined);
export const useGrowiCloudUri = (): UseAtom<typeof growiCloudUriAtom> => {
  return useAtom(growiCloudUriAtom);
};

// Forced Color Scheme atom (no persistence needed as it's server-provided)
export const forcedColorSchemeAtom = atom<ColorScheme | undefined>(undefined);
export const useForcedColorScheme = (): UseAtom<typeof forcedColorSchemeAtom> => {
  return useAtom(forcedColorSchemeAtom);
};
