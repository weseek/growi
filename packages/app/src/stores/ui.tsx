import { RefObject } from 'react';

import { isClient, pagePathUtils } from '@growi/core';
import { Breakpoint, addBreakpointListener } from '@growi/ui';
import SimpleBar from 'simplebar-react';
import {
  useSWRConfig, SWRResponse, Key, Fetcher,
} from 'swr';
import useSWRImmutable from 'swr/immutable';

import { IFocusable } from '~/client/interfaces/focusable';
import { useUserUISettings } from '~/client/services/user-ui-settings';
import { Nullable } from '~/interfaces/common';
import { SidebarContentsType } from '~/interfaces/ui';
import { UpdateDescCountData } from '~/interfaces/websocket';
import loggerFactory from '~/utils/logger';

import {
  useCurrentPageId, useCurrentPagePath, useIsEditable, useIsTrashPage, useIsUserPage, useIsGuestUser,
  useIsNotCreatable, useIsSharedUser, useNotFoundTargetPathOrId, useIsForbidden, useIsIdenticalPath, useIsNotFoundPermalink, useCurrentUser, useIsDeleted,
} from './context';
import { localStorageMiddleware } from './middlewares/sync-to-storage';
import { useStaticSWR } from './use-static-swr';

const { isSharedPage } = pagePathUtils;

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


/** **********************************************************
 *                     Storing RefObjects
 *********************************************************** */

export const useSidebarScrollerRef = (initialData?: RefObject<SimpleBar>): SWRResponse<RefObject<SimpleBar>, Error> => {
  return useStaticSWR<RefObject<SimpleBar>, Error>('sidebarScrollerRef', initialData);
};


/** **********************************************************
 *                          SWR Hooks
 *                      for switching UI
 *********************************************************** */

export const useIsMobile = (): SWRResponse<boolean, Error> => {
  const key = isClient() ? 'isMobile' : null;

  let configuration;
  if (isClient()) {
    const userAgent = window.navigator.userAgent.toLowerCase();
    configuration = {
      fallbackData: /iphone|ipad|android/.test(userAgent),
    };
  }

  return useStaticSWR<boolean, Error>(key, undefined, configuration);
};

const updateBodyClassesByEditorMode = (newEditorMode: EditorMode, isSidebar = false) => {
  switch (newEditorMode) {
    case EditorMode.View:
      $('body').removeClass('on-edit');
      $('body').removeClass('builtin-editor');
      $('body').removeClass('hackmd');
      $('body').removeClass('editing-sidebar');
      break;
    case EditorMode.Editor:
      $('body').addClass('on-edit');
      $('body').addClass('builtin-editor');
      $('body').removeClass('hackmd');
      // editing /Sidebar
      if (isSidebar) {
        $('body').addClass('editing-sidebar');
      }
      break;
    case EditorMode.HackMD:
      $('body').addClass('on-edit');
      $('body').addClass('hackmd');
      $('body').removeClass('builtin-editor');
      $('body').removeClass('editing-sidebar');
      break;
  }
};

const updateHashByEditorMode = (newEditorMode: EditorMode) => {
  const { pathname } = window.location;

  switch (newEditorMode) {
    case EditorMode.View:
      window.history.replaceState(null, '', pathname);
      break;
    case EditorMode.Editor:
      window.history.replaceState(null, '', `${pathname}#edit`);
      break;
    case EditorMode.HackMD:
      window.history.replaceState(null, '', `${pathname}#hackmd`);
      break;
  }
};

export const determineEditorModeByHash = (): EditorMode => {
  const { hash } = window.location;

  switch (hash) {
    case '#edit':
      return EditorMode.Editor;
    case '#hackmd':
      return EditorMode.HackMD;
    default:
      return EditorMode.View;
  }
};

let isEditorModeLoaded = false;
export const useEditorMode = (): SWRResponse<EditorMode, Error> => {
  const { data: _isEditable } = useIsEditable();

  const editorModeByHash = determineEditorModeByHash();

  const isLoading = _isEditable === undefined;
  const isEditable = !isLoading && _isEditable;
  const initialData = isEditable ? editorModeByHash : EditorMode.View;

  const { data: currentPagePath } = useCurrentPagePath();
  const isSidebar = currentPagePath === '/Sidebar';

  const swrResponse = useSWRImmutable(
    isLoading ? null : ['editorMode', isEditable],
    null,
    { fallbackData: initialData },
  );

  // initial updating
  if (!isEditorModeLoaded && !isLoading && swrResponse.data != null) {
    if (isEditable) {
      updateBodyClassesByEditorMode(swrResponse.data, isSidebar);
    }
    isEditorModeLoaded = true;
  }

  return {
    ...swrResponse,

    // overwrite mutate
    mutate: (editorMode: EditorMode, shouldRevalidate?: boolean) => {
      if (!isEditable) {
        return Promise.resolve(EditorMode.View); // fixed if not editable
      }
      updateBodyClassesByEditorMode(editorMode, isSidebar);
      updateHashByEditorMode(editorMode);
      return swrResponse.mutate(editorMode, shouldRevalidate);
    },
  };
};

export const useIsDeviceSmallerThanMd = (): SWRResponse<boolean, Error> => {
  const key: Key = isClient() ? 'isDeviceSmallerThanMd' : null;

  const { cache, mutate } = useSWRConfig();

  if (isClient()) {
    const mdOrAvobeHandler = function(this: MediaQueryList): void {
      // sm -> md: matches will be true
      // md -> sm: matches will be false
      mutate(key, !this.matches);
    };
    const mql = addBreakpointListener(Breakpoint.MD, mdOrAvobeHandler);

    // initialize
    if (cache.get(key) == null) {
      document.addEventListener('DOMContentLoaded', () => {
        mutate(key, !mql.matches);
      });
    }
  }

  return useStaticSWR(key);
};

export const useIsDeviceSmallerThanLg = (): SWRResponse<boolean, Error> => {
  const key: Key = isClient() ? 'isDeviceSmallerThanLg' : null;

  const { cache, mutate } = useSWRConfig();

  if (isClient()) {
    const lgOrAvobeHandler = function(this: MediaQueryList): void {
      // md -> lg: matches will be true
      // lg -> md: matches will be false
      mutate(key, !this.matches);
    };
    const mql = addBreakpointListener(Breakpoint.LG, lgOrAvobeHandler);

    // initialize
    if (cache.get(key) == null) {
      document.addEventListener('DOMContentLoaded', () => {
        mutate(key, !mql.matches);
      });
    }
  }

  return useStaticSWR(key);
};

type PreferDrawerModeByUserUtils = {
  update: (preferDrawerMode: boolean) => void
}

export const usePreferDrawerModeByUser = (initialData?: boolean): SWRResponse<boolean, Error> & PreferDrawerModeByUserUtils => {
  const { data: isGuestUser } = useIsGuestUser();
  const { scheduleToPut } = useUserUISettings();

  const swrResponse: SWRResponse<boolean, Error> = useStaticSWR('preferDrawerModeByUser', initialData, { use: isGuestUser ? [localStorageMiddleware] : [] });

  return {
    ...swrResponse,
    data: swrResponse.data,
    update: (preferDrawerMode: boolean) => {
      swrResponse.mutate(preferDrawerMode);

      if (!isGuestUser) {
        scheduleToPut({ preferDrawerModeByUser: preferDrawerMode });
      }
    },
  };
};

export const usePreferDrawerModeOnEditByUser = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('preferDrawerModeOnEditByUser', initialData, { fallbackData: true });
};

export const useSidebarCollapsed = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isSidebarCollapsed', initialData, { fallbackData: false });
};

export const useCurrentSidebarContents = (initialData?: SidebarContentsType): SWRResponse<SidebarContentsType, Error> => {
  return useStaticSWR('sidebarContents', initialData, { fallbackData: SidebarContentsType.TREE });
};

export const useCurrentProductNavWidth = (initialData?: number): SWRResponse<number, Error> => {
  return useStaticSWR('productNavWidth', initialData, { fallbackData: 320 });
};

export const useDrawerMode = (): SWRResponse<boolean, Error> => {
  const { data: editorMode } = useEditorMode();
  const { data: preferDrawerModeByUser } = usePreferDrawerModeByUser();
  const { data: preferDrawerModeOnEditByUser } = usePreferDrawerModeOnEditByUser();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();

  const condition = editorMode != null || preferDrawerModeByUser != null || preferDrawerModeOnEditByUser != null || isDeviceSmallerThanMd != null;

  const calcDrawerMode: Fetcher<boolean> = (
      key: Key, editorMode: EditorMode, preferDrawerModeByUser: boolean, preferDrawerModeOnEditByUser: boolean, isDeviceSmallerThanMd: boolean,
  ): boolean => {

    // get preference on view or edit
    const preferDrawerMode = editorMode !== EditorMode.View ? preferDrawerModeOnEditByUser : preferDrawerModeByUser;

    return isDeviceSmallerThanMd || preferDrawerMode;
  };

  return useSWRImmutable(
    condition ? ['isDrawerMode', editorMode, preferDrawerModeByUser, preferDrawerModeOnEditByUser, isDeviceSmallerThanMd] : null,
    calcDrawerMode,
    {
      fallback: calcDrawerMode,
    },
  );
};

export const useDrawerOpened = (isOpened?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isDrawerOpened', isOpened, { fallbackData: false });
};

export const useSidebarResizeDisabled = (isDisabled?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isSidebarResizeDisabled', isDisabled, { fallbackData: false });
};


export const useSelectedGrant = (initialData?: number): SWRResponse<number, Error> => {
  return useStaticSWR<number, Error>('grant', initialData);
};

export const useSelectedGrantGroupId = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('grantGroupId', initialData);
};

export const useSelectedGrantGroupName = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('grantGroupName', initialData);
};

export const useGlobalSearchFormRef = (initialData?: RefObject<IFocusable>): SWRResponse<RefObject<IFocusable>, Error> => {
  return useStaticSWR('globalSearchTypeahead', initialData);
};

type PageTreeDescCountMapUtils = {
  update(newData?: UpdateDescCountData): Promise<UpdateDescCountData | undefined>
  getDescCount(pageId?: string): number | null | undefined
}

export const usePageTreeDescCountMap = (initialData?: UpdateDescCountData): SWRResponse<UpdateDescCountData, Error> & PageTreeDescCountMapUtils => {
  const key = 'pageTreeDescCountMap';

  const swrResponse = useStaticSWR<UpdateDescCountData, Error>(key, initialData, { fallbackData: new Map() });

  return {
    ...swrResponse,
    getDescCount: (pageId?: string) => (pageId != null ? swrResponse.data?.get(pageId) : null),
    update: (newData: UpdateDescCountData) => swrResponse.mutate(new Map([...(swrResponse.data || new Map()), ...newData])),
  };
};


/** **********************************************************
 *                          SWR Hooks
 *                Determined value by context
 *********************************************************** */

export const useIsAbleToShowTrashPageManagementButtons = (): SWRResponse<boolean, Error> => {
  const { data: currentUser } = useCurrentUser();
  const { data: isDeleted } = useIsDeleted();

  return useStaticSWR('isAbleToShowTrashPageManagementButtons', isDeleted && currentUser != null);
};

export const useIsAbleToShowPageManagement = (): SWRResponse<boolean, Error> => {
  const key = 'isAbleToShowPageManagement';
  const { data: currentPageId } = useCurrentPageId();
  const { data: isTrashPage } = useIsTrashPage();
  const { data: isSharedUser } = useIsSharedUser();

  const includesUndefined = [currentPageId, isTrashPage, isSharedUser].some(v => v === undefined);
  const isPageExist = currentPageId != null;

  return useSWRImmutable(
    includesUndefined ? null : key,
    () => isPageExist && !isTrashPage && !isSharedUser,
  );
};

export const useIsAbleToShowTagLabel = (): SWRResponse<boolean, Error> => {
  const key = 'isAbleToShowTagLabel';
  const { data: isUserPage } = useIsUserPage();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isIdenticalPath } = useIsIdenticalPath();
  const { data: notFoundTargetPathOrId } = useNotFoundTargetPathOrId();
  const { data: editorMode } = useEditorMode();

  const includesUndefined = [isUserPage, currentPagePath, isIdenticalPath, notFoundTargetPathOrId, editorMode].some(v => v === undefined);

  const isViewMode = editorMode === EditorMode.View;
  const isNotFoundPage = notFoundTargetPathOrId != null;

  return useSWRImmutable(
    includesUndefined ? null : [key, editorMode],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => !isUserPage && !isSharedPage(currentPagePath!) && !isIdenticalPath && !(isViewMode && isNotFoundPage),
  );
};

export const useIsAbleToShowPageEditorModeManager = (): SWRResponse<boolean, Error> => {
  const key = 'isAbleToShowPageEditorModeManager';
  const { data: isNotCreatable } = useIsNotCreatable();
  const { data: isForbidden } = useIsForbidden();
  const { data: isTrashPage } = useIsTrashPage();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: isNotFoundPermalink } = useIsNotFoundPermalink();

  const includesUndefined = [isNotCreatable, isForbidden, isTrashPage, isSharedUser, isNotFoundPermalink].some(v => v === undefined);

  return useSWRImmutable(
    includesUndefined ? null : key,
    () => !isNotCreatable && !isForbidden && !isTrashPage && !isSharedUser && !isNotFoundPermalink,
  );
};

export const useIsAbleToShowPageAuthors = (): SWRResponse<boolean, Error> => {
  const key = 'isAbleToShowPageAuthors';
  const { data: currentPageId } = useCurrentPageId();
  const { data: isUserPage } = useIsUserPage();

  const includesUndefined = [currentPageId, isUserPage].some(v => v === undefined);
  const isPageExist = currentPageId != null;

  return useSWRImmutable(
    includesUndefined ? null : key,
    () => isPageExist && !isUserPage,
  );
};
