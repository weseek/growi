import { mutate, responseInterface, cache } from 'swr';
import { Breakpoint } from '~/interfaces/breakpoints';
import { addBreakpointListener } from '~/utils/browser-utils';

import loggerFactory from '~/utils/logger';

import { isUserPage, isSharedPage, isCreatablePage } from '~/utils/path-utils';
import {
  useTrash, useNotFound, useCurrentPagePath, useCurrentUser, useIsSharedUser, useForbidden,
} from './context';
import { useCurrentPageDeleted, useDescendantsCount, useCurrentPageSWR } from './page';
import { useStaticSWR } from './use-static-swr';

const logger = loggerFactory('growi:stores:ui');


/** **********************************************************
 *                          Unions
 *********************************************************** */
export const EditorMode = {
  View: 'view',
  Editor: 'editor',
  HackMD: 'hackmd',
} as const;
export type EditorMode = typeof EditorMode[keyof typeof EditorMode];

export const SidebarContents = {
  CUSTOM: 'custom',
  RECENT: 'recent',
} as const;
export type SidebarContents = typeof SidebarContents[keyof typeof SidebarContents];

/** **********************************************************
 *                          SWR Hooks
 *                Determined value by context
 *********************************************************** */

export const useIsAbleToShowEmptyTrashButton = (): responseInterface<boolean, Error> => {
  const { data: currentUser } = useCurrentUser();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: descendantsCount } = useDescendantsCount(currentPagePath);

  const hasChildren = (descendantsCount || 0) > 0;
  const isAbleToShowEmptyTrashButton = currentUser != null && currentUser.admin && currentPagePath === '/trash' && hasChildren;

  return useStaticSWR('isAbleToShowEmptyTrashButton', isAbleToShowEmptyTrashButton);
};

export const useIsAbleToShowTrashPageManagementButtons = (): responseInterface<boolean, Error> => {
  const { data: currentUser } = useCurrentUser();
  const { data: isDeleted } = useCurrentPageDeleted();

  return useStaticSWR('isAbleToShowTrashPageManagementButtons', isDeleted && currentUser != null);
};

export const useIsAbleToShowPageReactionButtons = (): responseInterface<boolean, any> => {
  const { data: isTrashPage } = useTrash();
  const { data: isNotFoundPage } = useNotFound();
  const { data: isSharedUser } = useIsSharedUser();

  return useStaticSWR('isAbleToShowPageReactionButtons', !isTrashPage && !isNotFoundPage && !isSharedUser);
};

export const useIsAbleToShowLikeButton = (): responseInterface<boolean, any> => {
  const key = 'isAbleToShowLikeButton';
  const { data: isSharedUser } = useIsSharedUser();
  const { data: page } = useCurrentPageSWR();

  if (page == null) {
    mutate(key, false, false);
  }
  else {
    mutate(key, !isUserPage(page.path) && !isSharedUser);
  }

  return useStaticSWR(key);
};

export const useIsAbleToShowTagLabel = (): responseInterface<boolean, any> => {
  const key = 'isAbleToShowTagLabel';
  const { data: page } = useCurrentPageSWR();
  const { data: isNotFoundPage } = useNotFound();
  // [TODO: getting if the current mode is 'view' or 'edit']
  const editorMode = 'view';

  if (page == null) {
    mutate(key, false, false);
  }
  else {
    // Tags cannot be edited while the new page and editorMode is 'view'
    mutate(key, !isUserPage(page.path) && !isSharedPage(page.path) && !(editorMode === 'view' && isNotFoundPage));
  }

  return useStaticSWR(key);
};

export const useIsAbleToShowPageAuthors = (): responseInterface<boolean, any> => {
  const key = 'isAbleToShowPageAuthors';
  const { data: page } = useCurrentPageSWR();
  const { data: isNotFoundPage } = useNotFound();

  if (page == null) {
    mutate(key, false, false);
  }
  else {
    mutate(key, !isNotFoundPage && !isUserPage(page.path));
  }

  return useStaticSWR(key);
};

export const useIsAbleToShowPageManagement = (): responseInterface<boolean, any> => {
  const { data: isNotFoundPage } = useNotFound();
  const { data: isTrashPage } = useTrash();
  const { data: isSharedUser } = useIsSharedUser();

  return useStaticSWR('isAbleToShowPageManagement', !isNotFoundPage && !isTrashPage && !isSharedUser);
};

export const useIsAbleToShowPageEditorModeManager = (): responseInterface<boolean, any> => {
  const key = 'isAbleToShowPageEditorModeManager';

  const { data: isForbidden } = useForbidden();
  const { data: isTrashPage } = useTrash();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: page } = useCurrentPageSWR();

  if (page == null) {
    mutate(key, false, false);
  }
  else {
    mutate(key, isCreatablePage(page.path) && !isForbidden && !isTrashPage && !isSharedUser);
  }

  return useStaticSWR(key);
};


/** **********************************************************
 *                          SWR Hooks
 *                      for switching UI
 *********************************************************** */

export const useIsDeviceSmallerThanMd = (): responseInterface<boolean, any> => {
  const isServer = typeof window === 'undefined';
  const key = isServer ? null : 'isDeviceSmallerThanMd';

  if (!isServer && !cache.has(key)) {
    const mdOrAvobeHandler = function(this: MediaQueryList): any {
      // sm -> md: matches will be true
      // md -> sm: matches will be false
      mutate(key, !this.matches);
    };
    addBreakpointListener(Breakpoint.MD, mdOrAvobeHandler, true);
  }

  return useStaticSWR(key);
};

export const useEditorMode = (editorMode?: EditorMode): responseInterface<EditorMode, any> => {
  const key = 'editorMode';

  if (editorMode == null) {
    if (!cache.has(key)) {
      mutate(key, EditorMode.View, false);
    }
  }
  else {
    mutate(key, editorMode);
  }

  return useStaticSWR(key);
};

export const usePageCreateModalOpened = (isOpened?: boolean): responseInterface<boolean, any> => {
  const key = 'isPageCreateModalOpened';

  if (isOpened == null) {
    if (!cache.has(key)) {
      mutate(key, false, false);
    }
  }
  else {
    mutate(key, isOpened);
  }

  return useStaticSWR(key);
};

export const useDrawerOpened = (isOpened?: boolean): responseInterface<boolean, any> => {
  const key = 'isDrawerOpened';

  if (isOpened == null) {
    if (!cache.has(key)) {
      mutate(key, false, false);
    }
  }
  else {
    mutate(key, isOpened);
  }

  return useStaticSWR(key);
};

export const useCurrentSidebarContents = (sidebarContents?: SidebarContents): responseInterface<SidebarContents, any> => {
  const key = 'sidebarContents';

  if (sidebarContents == null) {
    if (!cache.has(key)) {
      mutate(key, SidebarContents.RECENT, false);
    }
  }
  else {
    mutate(key, sidebarContents);
  }

  return useStaticSWR(key);
};
