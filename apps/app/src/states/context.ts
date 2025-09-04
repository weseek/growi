import { atom, useAtomValue, useSetAtom } from 'jotai';
import { currentUserAtomGetter, growiCloudUriAtomGetter } from './global';

/**
 * Atom for checking if current path is identical
 */
const isIdenticalPathAtom = atom<boolean>(false);

export const useIsIdenticalPath = () => useAtomValue(isIdenticalPathAtom);

/**
 * Atom for checking if current page is forbidden
 */
const isForbiddenAtom = atom<boolean>(false);

export const useIsForbidden = () => useAtomValue(isForbiddenAtom);

/**
 * Atom for checking if current page is not creatable
 */
const isNotCreatableAtom = atom<boolean>(false);

export const useIsNotCreatable = () => useAtomValue(isNotCreatableAtom);

/**
 * Computed atom for checking if current user is a guest user
 * Depends on currentUser atom
 */
const isGuestUserAtom = atom((get) => {
  const currentUser = get(currentUserAtomGetter);
  return currentUser?._id == null;
});

// export const useIsGuestUser = () => {
//   return useAtom(isGuestUserAtom);
// };
export const useIsGuestUser = () => useAtomValue(isGuestUserAtom);

/**
 * Computed atom for checking if current user is a read-only user
 * Depends on currentUser and isGuestUser atoms
 */
const isReadOnlyUserAtom = atom((get) => {
  const currentUser = get(currentUserAtomGetter);
  const isGuestUser = get(isGuestUserAtom);

  return !isGuestUser && !!currentUser?.readOnly;
});

export const useIsReadOnlyUser = () => useAtomValue(isReadOnlyUserAtom);

/**
 * Computed atom for checking if current user is an admin
 * Depends on currentUser atom
 */
const isAdminAtom = atom((get) => {
  const currentUser = get(currentUserAtomGetter);
  return currentUser?.admin ?? false;
});

export const useIsAdmin = () => useAtomValue(isAdminAtom);

/**
 * Atom for checking if current user is a shared user
 */
const isSharedUserAtom = atom<boolean>(false);

export const useIsSharedUser = () => useAtomValue(isSharedUserAtom);

/**
 * Atom for checking if current page is a search page
 */
const isSearchPageAtom = atom<boolean | null>(null);
/**
 * Hook for getting the current search page state
 */
export const useIsSearchPage = () => useAtomValue(isSearchPageAtom);
/**
 * Hook for setting the current search page state
 */
export const useSetSearchPage = () => useSetAtom(isSearchPageAtom);

/**
 * Computed atom for GROWI documentation URL
 * Depends on growiCloudUri atom
 */
const growiDocumentationUrlAtom = atom((get) => {
  const growiCloudUri = get(growiCloudUriAtomGetter);

  if (growiCloudUri != null) {
    const url = new URL('/help', growiCloudUri);
    return url.toString();
  }

  return 'https://docs.growi.org';
});

export const useGrowiDocumentationUrl = () =>
  useAtomValue(growiDocumentationUrlAtom);

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

export const useIsEditable = () => useAtomValue(isEditableAtom);
