import useSWR, {
  useSWRConfig, SWRResponse, Key, Fetcher, Middleware, mutate, SWRConfig,
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
const EDITOR_MODE: Key = 'editorMode';
const IS_DEVICE_SMALLER_THAN_MD: Key = isServer ? null : 'isDeviceSmallerThanMd';
const PREFER_DRAWER_MODE_BY_USER: Key = isServer ? null : 'preferDrawerModeByUser';
const PREFER_DRAWER_MODE_ON_EDIT_BY_USER: Key = isServer ? null : 'preferDrawerModeOnEditByUser';
const IS_DRAWER_MODE: Key = 'isDrawerMode';

export const mutateDrawerMode: Middleware = (useSWRNext) => {
  return (...args) => {
    const { mutate } = useSWRConfig();
    const swrNext = useSWRNext(...args);
    return {
      ...swrNext,
      mutate: (data, shouldRevalidate) => {
        return swrNext.mutate(data, shouldRevalidate)
          .then((value) => {
            mutate(IS_DRAWER_MODE); // mutate isDrawerMode
            return value;
          });
      },
    };
  };
};

export const useEditorMode = (editorMode?: EditorMode): SWRResponse<EditorMode, Error> => {
  const initialData = EditorMode.View;
  return useStaticSWR(EDITOR_MODE, editorMode || null, { fallbackData: initialData, use: [mutateDrawerMode] });
};

export const useIsDeviceSmallerThanMd = (): SWRResponse<boolean|null, Error> => {

  const { cache, mutate } = useSWRConfig();

  if (!isServer) {
    const mdOrAvobeHandler = function(this: MediaQueryList): void {
      // sm -> md: matches will be true
      // md -> sm: matches will be false
      mutate(IS_DEVICE_SMALLER_THAN_MD, !this.matches);
    };
    const mql = addBreakpointListener(Breakpoint.MD, mdOrAvobeHandler);

    // initialize
    if (cache.get(IS_DEVICE_SMALLER_THAN_MD) == null) {
      document.addEventListener('DOMContentLoaded', () => {
        mutate(IS_DEVICE_SMALLER_THAN_MD, !mql.matches);
      });
    }
  }

  return useStaticSWR(IS_DEVICE_SMALLER_THAN_MD, null, { use: [mutateDrawerMode] });
};

export const usePreferDrawerModeByUser = (isPrefered?: boolean): SWRResponse<boolean, Error> => {
  const initialData = localStorage?.preferDrawerModeByUser === 'true';

  return useStaticSWR(PREFER_DRAWER_MODE_BY_USER, isPrefered || null, { fallbackData: initialData, use: [mutateDrawerMode, sessionStorageMiddleware] });
};

export const usePreferDrawerModeOnEditByUser = (isPrefered?: boolean): SWRResponse<boolean, Error> => {
  const initialData = localStorage?.preferDrawerModeOnEditByUser == null || localStorage?.preferDrawerModeOnEditByUser === 'true';

  return useStaticSWR(PREFER_DRAWER_MODE_ON_EDIT_BY_USER, isPrefered || null, { fallbackData: initialData, use: [mutateDrawerMode, sessionStorageMiddleware] });
};

export const useDrawerMode = (): SWRResponse<boolean, Error> => {
  const { cache } = useSWRConfig();

  const { data: initEditorMode } = useEditorMode();
  const { data: initPreferDrawerModeByUser } = usePreferDrawerModeByUser();
  const { data: initPreferDrawerModeOnEditByUser } = usePreferDrawerModeOnEditByUser();
  const { data: initIsDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();

  const calcDrawerMode: Fetcher<boolean> = (): boolean => {
    const _editorMode = cache.get(EDITOR_MODE);
    const _preferDrawerModeByUser = cache.get(PREFER_DRAWER_MODE_BY_USER);
    const _preferDrawerModeOnEditByUser = cache.get(PREFER_DRAWER_MODE_ON_EDIT_BY_USER);
    const _isDeviceSmallerThanMd = cache.get(IS_DEVICE_SMALLER_THAN_MD);

    const editorMode = _editorMode != null ? _editorMode : initEditorMode;
    const preferDrawerModeByUser = _preferDrawerModeByUser != null ? _preferDrawerModeByUser : initPreferDrawerModeByUser;
    const preferDrawerModeOnEditByUser = _preferDrawerModeOnEditByUser != null ? _preferDrawerModeOnEditByUser : initPreferDrawerModeOnEditByUser;
    const isDeviceSmallerThanMd = _isDeviceSmallerThanMd != null ? _isDeviceSmallerThanMd : initIsDeviceSmallerThanMd;

    // get preference on view or edit
    const preferDrawerMode = editorMode !== EditorMode.View ? preferDrawerModeOnEditByUser : preferDrawerModeByUser;

    return isDeviceSmallerThanMd || preferDrawerMode;
  };

  return useSWR(IS_DRAWER_MODE, calcDrawerMode, { fallback: calcDrawerMode });
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
