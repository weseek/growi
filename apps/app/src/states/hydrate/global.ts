import { useHydrateAtoms } from 'jotai/utils';

import type { CommonProps } from '../../pages/utils/commons';
import {
  currentPathnameAtom,
  currentUserAtom,
  csrfTokenAtom,
  appTitleAtom,
  siteUrlAtom,
  confidentialAtom,
  growiVersionAtom,
  isMaintenanceModeAtom,
  isDefaultLogoAtom,
  growiCloudUriAtom,
  forcedColorSchemeAtom,
} from '../global';

/**
 * Hook for hydrating global UI state atoms with server-side data
 * This should be called early in the app component to ensure atoms are properly initialized before rendering
 *
 * @param commonProps - Server-side common properties from getServerSideCommonProps
 */
export const useHydrateGlobalAtoms = (commonProps: CommonProps): void => {
  // Hydrate global atoms with server-side data
  useHydrateAtoms([
    [currentPathnameAtom, commonProps.currentPathname],
    [currentUserAtom, commonProps.currentUser],
    [csrfTokenAtom, commonProps.csrfToken],
    [appTitleAtom, commonProps.appTitle],
    [siteUrlAtom, commonProps.siteUrl],
    [confidentialAtom, commonProps.confidential],
    [growiVersionAtom, commonProps.growiVersion],
    [isMaintenanceModeAtom, commonProps.isMaintenanceMode],
    [isDefaultLogoAtom, commonProps.isDefaultLogo],
    [growiCloudUriAtom, commonProps.growiCloudUri],
    [forcedColorSchemeAtom, commonProps.forcedColorScheme],
  ]);
};
