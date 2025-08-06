import { useHydrateAtoms } from 'jotai/utils';

import type { CommonInitialProps } from '~/pages/utils/commons';

import {
  appTitleAtom,
  siteUrlAtom,
  confidentialAtom,
  growiVersionAtom,
  isDefaultLogoAtom,
  growiCloudUriAtom,
  forcedColorSchemeAtom,
} from './global';

/**
 * Hook for hydrating global UI state atoms with server-side data
 * This should be called early in the app component to ensure atoms are properly initialized before rendering
 *
 * @param commonInitialProps - Server-side common properties from getServerSideCommonInitialProps
 */
export const useHydrateGlobalInitialAtoms = (commonInitialProps: CommonInitialProps): void => {
  // Hydrate global atoms with server-side data
  useHydrateAtoms([
    [appTitleAtom, commonInitialProps.appTitle],
    [siteUrlAtom, commonInitialProps.siteUrl],
    [confidentialAtom, commonInitialProps.confidential],
    [growiVersionAtom, commonInitialProps.growiVersion],
    [isDefaultLogoAtom, commonInitialProps.isDefaultLogo],
    [growiCloudUriAtom, commonInitialProps.growiCloudUri],
    [forcedColorSchemeAtom, commonInitialProps.forcedColorScheme],
  ]);
};
