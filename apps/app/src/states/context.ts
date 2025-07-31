import { atom, useAtom } from 'jotai';

import { currentUserAtom, growiCloudUriAtom } from './global';
import type { UseAtom } from './ui/helper';

/**
 * Computed atom for checking if current user is a guest user
 * Depends on currentUser atom
 */
const isGuestUserAtom = atom((get) => {
  const currentUser = get(currentUserAtom);
  return currentUser?._id == null;
});

export const useIsGuestUser = (): UseAtom<typeof isGuestUserAtom> => {
  return useAtom(isGuestUserAtom);
};

/**
 * Computed atom for checking if current user is a read-only user
 * Depends on currentUser and isGuestUser atoms
 */
const isReadOnlyUserAtom = atom((get) => {
  const currentUser = get(currentUserAtom);
  const isGuestUser = get(isGuestUserAtom);

  return !isGuestUser && !!currentUser?.readOnly;
});

export const useIsReadOnlyUser = (): UseAtom<typeof isReadOnlyUserAtom> => {
  return useAtom(isReadOnlyUserAtom);
};

/**
 * Computed atom for checking if current user is an admin
 * Depends on currentUser atom
 */
const isAdminAtom = atom((get) => {
  const currentUser = get(currentUserAtom);
  return currentUser?.admin ?? false;
});

export const useIsAdmin = (): UseAtom<typeof isAdminAtom> => {
  return useAtom(isAdminAtom);
};

/**
 * Computed atom for GROWI documentation URL
 * Depends on growiCloudUri atom
 */
const growiDocumentationUrlAtom = atom((get) => {
  const growiCloudUri = get(growiCloudUriAtom);

  if (growiCloudUri != null) {
    const url = new URL('/help', growiCloudUri);
    return url.toString();
  }

  return 'https://docs.growi.org';
});

export const useGrowiDocumentationUrl = (): UseAtom<typeof growiDocumentationUrlAtom> => {
  return useAtom(growiDocumentationUrlAtom);
};
