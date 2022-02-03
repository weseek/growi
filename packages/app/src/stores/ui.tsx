import useSWR, {
  useSWRConfig, SWRResponse, Key, Fetcher,
} from 'swr';
import useSWRImmutable from 'swr/immutable';

import { Breakpoint, addBreakpointListener } from '@growi/ui';

import { RefObject } from 'react';
import { SidebarContentsType } from '~/interfaces/ui';
import loggerFactory from '~/utils/logger';

import { useStaticSWR } from './use-static-swr';
import {
  useCurrentPagePath, useIsEditable, useIsPageExist, useIsTrashPage, useIsUserPage,
  useIsNotCreatable, useIsSharedUser, useNotFoundTargetPathOrId, useIsForbidden, useIsIdenticalPath,
} from './context';
import { IFocusable } from '~/client/interfaces/focusable';
import { isSharedPage } from '^/../core/src/utils/page-path-utils';

import { IPageForPageDeleteModal } from '~/components/PageDeleteModal';

const logger = loggerFactory('growi:stores:ui');

const isServer = typeof window === 'undefined';

type Nullable<T> = T | null;


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
 *                          SWR Hooks
 *                      for switching UI
 *********************************************************** */

export const useIsMobile = (): SWRResponse<boolean, Error> => {
  const key = isServer ? null : 'isMobile';

  let configuration;
  if (!isServer) {
    const userAgent = window.navigator.userAgent.toLowerCase();
    configuration = {
      fallbackData: /iphone|ipad|android/.test(userAgent),
    };
  }

  return useStaticSWR<boolean, Error>(key, undefined, configuration);
};

const updateBodyClassesByEditorMode = (newEditorMode: EditorMode) => {
  switch (newEditorMode) {
    case EditorMode.View:
      $('body').removeClass('on-edit');
      $('body').removeClass('builtin-editor');
      $('body').removeClass('hackmd');
      $('body').removeClass('pathname-sidebar');
      break;
    case EditorMode.Editor:
      $('body').addClass('on-edit');
      $('body').addClass('builtin-editor');
      $('body').removeClass('hackmd');
      // editing /Sidebar
      if (window.location.pathname === '/Sidebar') {
        $('body').addClass('pathname-sidebar');
      }
      break;
    case EditorMode.HackMD:
      $('body').addClass('on-edit');
      $('body').addClass('hackmd');
      $('body').removeClass('builtin-editor');
      $('body').removeClass('pathname-sidebar');
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

  const swrResponse = useSWRImmutable(
    isLoading ? null : ['editorMode', isEditable],
    null,
    { fallbackData: initialData },
  );

  // initial updating
  if (!isEditorModeLoaded && !isLoading && swrResponse.data != null) {
    if (isEditable) {
      updateBodyClassesByEditorMode(swrResponse.data);
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
      updateBodyClassesByEditorMode(editorMode);
      updateHashByEditorMode(editorMode);
      return swrResponse.mutate(editorMode, shouldRevalidate);
    },
  };
};

export const useIsDeviceSmallerThanMd = (): SWRResponse<boolean, Error> => {
  const key: Key = isServer ? null : 'isDeviceSmallerThanMd';

  const { cache, mutate } = useSWRConfig();

  if (!isServer) {
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
  const key: Key = isServer ? null : 'isDeviceSmallerThanLg';

  const { cache, mutate } = useSWRConfig();

  if (!isServer) {
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

export const usePreferDrawerModeByUser = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('preferDrawerModeByUser', initialData, { fallbackData: false });
};

export const usePreferDrawerModeOnEditByUser = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('preferDrawerModeOnEditByUser', initialData, { fallbackData: true });
};

export const useSidebarCollapsed = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isSidebarCollapsed', initialData, { fallbackData: false });
};

export const useCurrentSidebarContents = (initialData?: SidebarContentsType): SWRResponse<SidebarContentsType, Error> => {
  return useStaticSWR('sidebarContents', initialData, { fallbackData: SidebarContentsType.RECENT });
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

// PageCreateModal
type CreateModalStatus = {
  isOpened: boolean,
  path?: string,
}

type CreateModalStatusUtils = {
  open(path?: string): Promise<CreateModalStatus | undefined>
  close(): Promise<CreateModalStatus | undefined>
}

export const useCreateModalStatus = (status?: CreateModalStatus): SWRResponse<CreateModalStatus, Error> & CreateModalStatusUtils => {
  const initialData: CreateModalStatus = { isOpened: false };
  const swrResponse = useStaticSWR<CreateModalStatus, Error>('pageCreateModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (path?: string) => swrResponse.mutate({ isOpened: true, path }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};

export const useCreateModalOpened = (): SWRResponse<boolean, Error> => {
  const { data } = useCreateModalStatus();
  return useSWR(
    data != null ? ['isCreaateModalOpened', data] : null,
    () => {
      return data != null ? data.isOpened : false;
    },
  );
};

export const useCreateModalPath = (): SWRResponse<any | null | undefined, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: status } = useCreateModalStatus();

  return useSWR(
    currentPagePath != null && status != null ? [currentPagePath, status] : null,
    (currentPagePath, status) => {
      return status?.path || currentPagePath;
    },
  );
};

// PageDeleteModal
type DeleteModalStatus = {
  isOpened: boolean,
  pages?: any,
}

type DeleteModalStatusUtils = {
  open(pages?: IPageForPageDeleteModal[]): Promise<DeleteModalStatus | undefined>
  close(): Promise<DeleteModalStatus | undefined>
}

export const usePageDeleteModalStatus = (status?: DeleteModalStatus): SWRResponse<DeleteModalStatus, Error> & DeleteModalStatusUtils => {
  const initialData: DeleteModalStatus = { isOpened: false };
  const swrResponse = useStaticSWR<DeleteModalStatus, Error>('deleteModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (pages?: IPageForPageDeleteModal[]) => swrResponse.mutate({ isOpened: true, pages }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};

export const usePageDeleteModalOpened = (): SWRResponse<boolean, Error> => {
  const { data } = usePageDeleteModalStatus();
  return useSWR(
    data != null ? ['isDeleteModalOpened', data] : null,
    () => {
      return data != null ? data.isOpened : false;
    },
  );
};


export const useSelectedGrant = (initialData?: Nullable<number>): SWRResponse<Nullable<number>, Error> => {
  return useStaticSWR<Nullable<number>, Error>('grant', initialData);
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

export const useIsAbleToShowPageManagement = (): SWRResponse<boolean, Error> => {
  const key = 'isAbleToShowPageManagement';
  const { data: isPageExist } = useIsPageExist();
  const { data: isTrashPage } = useIsTrashPage();
  const { data: isSharedUser } = useIsSharedUser();

  const includesUndefined = [isPageExist, isTrashPage, isSharedUser].some(v => v === undefined);

  return useSWRImmutable(
    includesUndefined ? null : key,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => isPageExist! && !isTrashPage && !isSharedUser,
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
    includesUndefined ? null : key,
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

  const includesUndefined = [isNotCreatable, isForbidden, isTrashPage, isSharedUser].some(v => v === undefined);

  return useSWRImmutable(
    includesUndefined ? null : key,
    () => !isNotCreatable && !isForbidden && !isTrashPage && !isSharedUser,
  );
};

export const useIsAbleToShowPageAuthors = (): SWRResponse<boolean, Error> => {
  const key = 'isAbleToShowPageAuthors';
  const { data: isPageExist } = useIsPageExist();
  const { data: isUserPage } = useIsUserPage();

  const includesUndefined = [isPageExist, isUserPage].some(v => v === undefined);

  return useSWRImmutable(
    includesUndefined ? null : key,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => isPageExist! && !isUserPage,
  );
};
