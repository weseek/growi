import { atom, useAtom } from 'jotai';

import { currentUserAtom, growiCloudUriAtom } from './global';
import type { UseAtom } from './helper';

/**
 * Atom for checking if current path is identical
 */
const isIdenticalPathAtom = atom<boolean>(false);

export const useIsIdenticalPath = (): UseAtom<typeof isIdenticalPathAtom> => {
  return useAtom(isIdenticalPathAtom);
};

/**
 * Atom for checking if current page is forbidden
 */
const isForbiddenAtom = atom<boolean>(false);

export const useIsForbidden = (): UseAtom<typeof isForbiddenAtom> => {
  return useAtom(isForbiddenAtom);
};

/**
 * Atom for checking if current page is not creatable
 */
const isNotCreatableAtom = atom<boolean>(false);

export const useIsNotCreatable = (): UseAtom<typeof isNotCreatableAtom> => {
  return useAtom(isNotCreatableAtom);
};

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
 * Atom for checking if current user is a shared user
 */
const isSharedUserAtom = atom<boolean>(false);

export const useIsSharedUser = (): UseAtom<typeof isSharedUserAtom> => {
  return useAtom(isSharedUserAtom);
};

/**
 * Atom for checking if current page is a search page
 */
const isSearchPageAtom = atom<boolean | null>(null);

export const useIsSearchPage = (): UseAtom<typeof isSearchPageAtom> => {
  return useAtom(isSearchPageAtom);
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

export const useGrowiDocumentationUrl = (): UseAtom<
  typeof growiDocumentationUrlAtom
> => {
  return useAtom(growiDocumentationUrlAtom);
};

/**
 * Computed atom for checking if current page is editable
 * Depends on multiple atoms: isGuestUser, isReadOnlyUser, isForbidden, isNotCreatable, isIdenticalPath
 */
const isEditableAtom = atom((get) => {
  const isGuestUser = get(isGuestUserAtom);
  const isReadOnlyUser = get(isReadOnlyUserAtom);
  const isForbidden = get(isForbiddenAtom);
  const isNotCreatable = get(isNotCreatableAtom);
  const isIdenticalPath = get(isIdenticalPathAtom);

  return (
    !isForbidden &&
    !isIdenticalPath &&
    !isNotCreatable &&
    !isGuestUser &&
    !isReadOnlyUser
  );
});

export const useIsEditable = (): UseAtom<typeof isEditableAtom> => {
  return useAtom(isEditableAtom);
};
