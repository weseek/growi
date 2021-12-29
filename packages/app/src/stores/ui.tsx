import useSWR, {
  useSWRConfig, SWRResponse, Key, Fetcher,
} from 'swr';
import useSWRImmutable from 'swr/immutable';

import { Breakpoint, addBreakpointListener } from '@growi/ui';

import { RefObject } from 'react';
import { SidebarContentsType } from '~/interfaces/ui';
import loggerFactory from '~/utils/logger';

import { useStaticSWR } from './use-static-swr';
import { useCurrentPagePath, useIsEditable } from './context';
import { IFocusable } from '~/client/interfaces/focusable';

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

export const useIsMobile = (): SWRResponse<boolean|null, Error> => {
  const key = isServer ? null : 'isMobile';

  let configuration;
  if (!isServer) {
    const userAgent = window.navigator.userAgent.toLowerCase();
    configuration = {
      fallbackData: /iphone|ipad|android/.test(userAgent),
    };
  }

  return useStaticSWR(key, null, configuration);
};


const updateBodyClassesForEditorMode = (newEditorMode: EditorMode) => {
  switch (newEditorMode) {
    case EditorMode.View:
      $('body').removeClass('on-edit');
      $('body').removeClass('builtin-editor');
      $('body').removeClass('hackmd');
      $('body').removeClass('pathname-sidebar');
      window.history.replaceState(null, '', window.location.pathname);
      break;
    case EditorMode.Editor:
      $('body').addClass('on-edit');
      $('body').addClass('builtin-editor');
      $('body').removeClass('hackmd');
      // editing /Sidebar
      if (window.location.pathname === '/Sidebar') {
        $('body').addClass('pathname-sidebar');
      }
      window.location.hash = '#edit';
      break;
    case EditorMode.HackMD:
      $('body').addClass('on-edit');
      $('body').addClass('hackmd');
      $('body').removeClass('builtin-editor');
      $('body').removeClass('pathname-sidebar');
      window.location.hash = '#hackmd';
      break;
  }
};

export const useEditorModeByHash = (): SWRResponse<EditorMode, Error> => {
  return useSWRImmutable(
    ['initialEditorMode', window.location.hash],
    (key: Key, hash: string) => {
      switch (hash) {
        case '#edit':
          return EditorMode.Editor;
        case '#hackmd':
          return EditorMode.HackMD;
        default:
          return EditorMode.View;
      }
    },
  );
};

let isEditorModeLoaded = false;
export const useEditorMode = (): SWRResponse<EditorMode, Error> => {
  const { data: _isEditable } = useIsEditable();
  const { data: editorModeByHash } = useEditorModeByHash();

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
      updateBodyClassesForEditorMode(swrResponse.data);
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
      updateBodyClassesForEditorMode(editorMode);
      return swrResponse.mutate(editorMode, shouldRevalidate);
    },
  };
};

export const useIsDeviceSmallerThanMd = (): SWRResponse<boolean|null, Error> => {
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

export const useIsDeviceSmallerThanLg = (): SWRResponse<boolean|null, Error> => {
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
  return useStaticSWR('preferDrawerModeByUser', initialData ?? null, { fallbackData: false });
};

export const usePreferDrawerModeOnEditByUser = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('preferDrawerModeOnEditByUser', initialData ?? null, { fallbackData: true });
};

export const useSidebarCollapsed = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isSidebarCollapsed', initialData ?? null, { fallbackData: false });
};

export const useCurrentSidebarContents = (initialData?: SidebarContentsType): SWRResponse<SidebarContentsType, Error> => {
  return useStaticSWR('sidebarContents', initialData ?? null, { fallbackData: SidebarContentsType.RECENT });
};

export const useCurrentProductNavWidth = (initialData?: number): SWRResponse<number, Error> => {
  return useStaticSWR('productNavWidth', initialData ?? null, { fallbackData: 320 });
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
  const initialData = false;
  return useStaticSWR('isDrawerOpened', isOpened || null, { fallbackData: initialData });
};

export const useSidebarResizeDisabled = (isDisabled?: boolean): SWRResponse<boolean, Error> => {
  const initialData = false;
  return useStaticSWR('isSidebarResizeDisabled', isDisabled || null, { fallbackData: initialData });
};

type CreateModalStatus = {
  isOpened: boolean,
  path?: string,
}

type CreateModalStatusUtils = {
  open(path?: string): Promise<CreateModalStatus | undefined>
  close(): Promise<CreateModalStatus | undefined>
}

export const useCreateModalStatus = (status?: CreateModalStatus): SWRResponse<CreateModalStatus, Error> & CreateModalStatusUtils => {
  const swrResponse = useStaticSWR<CreateModalStatus, Error>('modalStatus', status || null);

  return {
    ...swrResponse,
    open: (path?: string) => swrResponse.mutate({ isOpened: true, path }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};

export const useCreateModalOpened = (): SWRResponse<boolean, Error> => {
  const { data } = useCreateModalStatus();
  return useSWR(
    data != null ? ['isModalOpened', data] : null,
    () => {
      return data != null ? data.isOpened : false;
    },
  );
};

export const useCreateModalPath = (): SWRResponse<string, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: status } = useCreateModalStatus();

  return useSWR(
    [currentPagePath, status],
    (currentPagePath, status) => {
      return status.path || currentPagePath;
    },
  );
};


export const useSelectedGrant = (initialData?: Nullable<number>): SWRResponse<Nullable<number>, Error> => {
  return useStaticSWR<Nullable<number>, Error>('grant', initialData ?? null);
};

export const useSelectedGrantGroupId = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('grantGroupId', initialData ?? null);
};

export const useSelectedGrantGroupName = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('grantGroupName', initialData ?? null);
};

export const useGlobalSearchFormRef = (initialData?: RefObject<IFocusable>): SWRResponse<RefObject<IFocusable>, Error> => {
  return useStaticSWR('globalSearchTypeahead', initialData ?? null);
};
