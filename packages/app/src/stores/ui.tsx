import useSWR, {
  useSWRConfig, SWRResponse, Key, Fetcher, Middleware,
} from 'swr';
import useSWRImmutable from 'swr/immutable';

import { Breakpoint, addBreakpointListener } from '@growi/ui';

import { apiv3Get } from '~/client/util/apiv3-client';
import { SidebarContentsType } from '~/interfaces/ui';
import loggerFactory from '~/utils/logger';

import { sessionStorageMiddleware } from './middlewares/sync-to-storage';
import { useStaticSWR } from './use-static-swr';
import { IUserUISettings } from '~/interfaces/user-ui-settings';

const logger = loggerFactory('growi:stores:ui');

const isServer = typeof window === 'undefined';


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

export const useSWRxUserUISettings = (): SWRResponse<IUserUISettings, Error> => {
  const key = isServer ? null : 'userUISettings';

  return useSWRImmutable(
    key,
    () => apiv3Get<IUserUISettings>('/user-ui-settings').then(response => response.data),
  );
};


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

// drawer mode keys
const IS_DRAWER_MODE: Key = 'isDrawerMode';


const mutateDrawerMode: Middleware = (useSWRNext) => {
  return (...args) => {
    return useSWRNext(...args);
    // -- TODO: https://redmine.weseek.co.jp/issues/81817
    // const { mutate } = useSWRConfig();
    // const swrNext = useSWRNext(...args);
    // return {
    //   ...swrNext,
    //   mutate: (data, shouldRevalidate) => {
    //     return swrNext.mutate(data, shouldRevalidate)
    //       .then((value) => {
    //         mutate(IS_DRAWER_MODE); // mutate isDrawerMode
    //         return value;
    //       });
    //   },
    // };
  };
};

const postChangeEditorModeMiddleware: Middleware = (useSWRNext) => {
  return (...args) => {
    // -- TODO: https://redmine.weseek.co.jp/issues/81817
    const swrNext = useSWRNext(...args);
    return {
      ...swrNext,
      mutate: (data, shouldRevalidate) => {
        return swrNext.mutate(data, shouldRevalidate)
          .then((value) => {
            const newEditorMode = value as unknown as EditorMode;
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
            return value;
          });
      },
    };
  };
};

export const useEditorMode = (editorMode?: EditorMode): SWRResponse<EditorMode, Error> => {
  const key: Key = 'editorMode';
  const initialData = EditorMode.View;

  return useStaticSWR(key, editorMode || null, { fallbackData: initialData, use: [postChangeEditorModeMiddleware] });
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

  return useStaticSWR(key, null, { use: [mutateDrawerMode] });
};

export const usePreferDrawerModeByUser = (isPrefered?: boolean): SWRResponse<boolean, Error> => {
  const { data } = useSWRxUserUISettings();
  const key: Key = data === undefined ? null : 'preferDrawerModeByUser';
  const initialData = data?.preferDrawerModeByUser;

  return useStaticSWR(key, isPrefered || null, { fallbackData: initialData, use: [mutateDrawerMode, sessionStorageMiddleware] });
};

export const usePreferDrawerModeOnEditByUser = (isPrefered?: boolean): SWRResponse<boolean, Error> => {
  const { data } = useSWRxUserUISettings();
  const key: Key = data === undefined ? null : 'preferDrawerModeOnEditByUser';
  const initialData = data?.preferDrawerModeOnEditByUser;

  return useStaticSWR(key, isPrefered || null, { fallbackData: initialData, use: [mutateDrawerMode, sessionStorageMiddleware] });
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

  return useSWR(
    condition ? [IS_DRAWER_MODE, editorMode, preferDrawerModeByUser, preferDrawerModeOnEditByUser, isDeviceSmallerThanMd] : null,
    calcDrawerMode,
    {
      fallback: calcDrawerMode,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useDrawerOpened = (isOpened?: boolean): SWRResponse<boolean, Error> => {
  const initialData = false;
  return useStaticSWR('isDrawerOpened', isOpened || null, { fallbackData: initialData });
};

export const useSidebarCollapsed = (): SWRResponse<boolean, Error> => {
  const { data } = useSWRxUserUISettings();
  const key = data === undefined ? null : 'isSidebarCollapsed';
  const initialData = data?.isSidebarCollapsed || false;

  return useStaticSWR(
    key,
    null,
    {
      fallbackData: initialData,
      use: [sessionStorageMiddleware],
    },
  );
};

export const useCurrentSidebarContents = (): SWRResponse<SidebarContentsType, Error> => {
  const { data } = useSWRxUserUISettings();
  const key = data === undefined ? null : 'sidebarContents';
  const initialData = data?.currentSidebarContents || SidebarContentsType.RECENT;

  return useStaticSWR(
    key,
    null,
    {
      fallbackData: initialData,
      use: [sessionStorageMiddleware],
    },
  );
};

export const useCurrentProductNavWidth = (): SWRResponse<number, Error> => {
  const { data } = useSWRxUserUISettings();
  const key = data === undefined ? null : 'productNavWidth';
  const initialData = data?.currentProductNavWidth || 320;

  return useStaticSWR(
    key,
    null,
    {
      fallbackData: initialData,
      use: [sessionStorageMiddleware],
    },
  );
};

export const useSidebarResizeDisabled = (isDisabled?: boolean): SWRResponse<boolean, Error> => {
  const initialData = false;
  return useStaticSWR('isSidebarResizeDisabled', isDisabled || null, { fallbackData: initialData });
};

export const usePageCreateModalOpened = (isOpened?: boolean): SWRResponse<boolean, Error> => {
  const initialData = false;
  return useStaticSWR('isPageCreateModalOpened', isOpened || null, { fallbackData: initialData });
};
