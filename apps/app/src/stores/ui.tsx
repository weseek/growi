import { type RefObject, useCallback, useEffect } from 'react';

import { PageGrant, type Nullable } from '@growi/core';
import { type SWRResponseWithUtils, useSWRStatic } from '@growi/core/dist/swr';
import { pagePathUtils, isClient, isServer } from '@growi/core/dist/utils';
import { Breakpoint } from '@growi/ui/dist/interfaces';
import { addBreakpointListener, cleanupBreakpointListener } from '@growi/ui/dist/utils';
import type { HtmlElementNode } from 'rehype-toc';
import type SimpleBar from 'simplebar-react';
import {
  useSWRConfig, type SWRResponse, type Key,
} from 'swr';
import useSWRImmutable from 'swr/immutable';

import type { IFocusable } from '~/client/interfaces/focusable';
import type { IPageGrantData } from '~/interfaces/page';
import { SidebarContentsType } from '~/interfaces/ui';
import type { UpdateDescCountData } from '~/interfaces/websocket';
import {
  useIsNotFound, useCurrentPagePath, useIsTrashPage, useCurrentPageId,
} from '~/stores/page';
import loggerFactory from '~/utils/logger';

import {
  useIsEditable, useIsReadOnlyUser,
  useIsSharedUser, useIsIdenticalPath, useCurrentUser, useShareLinkId,
} from './context';
import { useStaticSWR } from './use-static-swr';

const { isTrashTopPage, isUsersTopPage } = pagePathUtils;

const logger = loggerFactory('growi:stores:ui');


/** **********************************************************
 *                          Unions
 *********************************************************** */

export const EditorMode = {
  View: 'view',
  Editor: 'editor',
} as const;
export type EditorMode = typeof EditorMode[keyof typeof EditorMode];


/** **********************************************************
 *                     Storing objects to ref
 *********************************************************** */

export const useSidebarScrollerRef = (initialData?: RefObject<SimpleBar>): SWRResponse<RefObject<SimpleBar>, Error> => {
  return useStaticSWR<RefObject<SimpleBar>, Error>('sidebarScrollerRef', initialData);
};

export const useCurrentPageTocNode = (): SWRResponse<HtmlElementNode, any> => {
  const { data: currentPagePath } = useCurrentPagePath();

  return useStaticSWR(['currentPageTocNode', currentPagePath]);
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

const getClassNamesByEditorMode = (editorMode: EditorMode | undefined): string[] => {
  const classNames: string[] = [];
  switch (editorMode) {
    case EditorMode.Editor:
      classNames.push('editing', 'builtin-editor');
      break;
  }

  return classNames;
};

export const EditorModeHash = {
  View: '',
  Edit: '#edit',
} as const;
export type EditorModeHash = typeof EditorModeHash[keyof typeof EditorModeHash];

export const isEditorModeHash = (hash: string): hash is EditorModeHash => Object.values<string>(EditorModeHash).includes(hash);

const updateHashByEditorMode = (newEditorMode: EditorMode) => {
  const { pathname, search } = window.location;

  switch (newEditorMode) {
    case EditorMode.View:
      window.history.replaceState(null, '', `${pathname}${search}${EditorModeHash.View}`);
      break;
    case EditorMode.Editor:
      window.history.replaceState(null, '', `${pathname}${search}${EditorModeHash.Edit}`);
      break;
  }
};

export const determineEditorModeByHash = (): EditorMode => {
  if (isServer()) {
    return EditorMode.View;
  }

  const { hash } = window.location;

  switch (hash) {
    case EditorModeHash.Edit:
      return EditorMode.Editor;
    default:
      return EditorMode.View;
  }
};

type EditorModeUtils = {
  getClassNamesByEditorMode: () => string[],
}

export const useEditorMode = (): SWRResponseWithUtils<EditorModeUtils, EditorMode> => {
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

  // construct overriding mutate method
  const mutateOriginal = swrResponse.mutate;
  const mutate = useCallback((editorMode: EditorMode, shouldRevalidate?: boolean) => {
    if (!isEditable) {
      return Promise.resolve(EditorMode.View); // fixed if not editable
    }
    updateHashByEditorMode(editorMode);
    return mutateOriginal(editorMode, shouldRevalidate);
  }, [isEditable, mutateOriginal]);

  const getClassNames = useCallback(() => {
    return getClassNamesByEditorMode(swrResponse.data);
  }, [swrResponse.data]);

  return Object.assign(swrResponse, {
    mutate,
    getClassNamesByEditorMode: getClassNames,
  });
};

export const useIsDeviceSmallerThanMd = (): SWRResponse<boolean, Error> => {
  const key: Key = isClient() ? 'isDeviceSmallerThanMd' : null;

  const { cache, mutate } = useSWRConfig();

  useEffect(() => {
    if (key != null) {
      const mdOrAvobeHandler = function(this: MediaQueryList): void {
        // sm -> md: matches will be true
        // md -> sm: matches will be false
        mutate(key, !this.matches);
      };
      const mql = addBreakpointListener(Breakpoint.MD, mdOrAvobeHandler);

      // initialize
      if (cache.get(key)?.data == null) {
        cache.set(key, { ...cache.get(key), data: !mql.matches });
      }

      return () => {
        cleanupBreakpointListener(mql, mdOrAvobeHandler);
      };
    }
  }, [cache, key, mutate]);

  return useStaticSWR(key);
};

export const useIsDeviceSmallerThanLg = (): SWRResponse<boolean, Error> => {
  const key: Key = isClient() ? 'isDeviceSmallerThanLg' : null;

  const { cache, mutate } = useSWRConfig();

  useEffect(() => {
    if (key != null) {
      const lgOrAvobeHandler = function(this: MediaQueryList): void {
        // md -> lg: matches will be true
        // lg -> md: matches will be false
        mutate(key, !this.matches);
      };
      const mql = addBreakpointListener(Breakpoint.LG, lgOrAvobeHandler);

      // initialize
      if (cache.get(key)?.data == null) {
        cache.set(key, { ...cache.get(key), data: !mql.matches });
      }

      return () => {
        cleanupBreakpointListener(mql, lgOrAvobeHandler);
      };
    }
  }, [cache, key, mutate]);

  return useStaticSWR(key);
};


export const useCurrentSidebarContents = (initialData?: SidebarContentsType): SWRResponse<SidebarContentsType, Error> => {
  return useSWRStatic('sidebarContents', initialData, { fallbackData: SidebarContentsType.TREE });
};

export const useCurrentProductNavWidth = (initialData?: number): SWRResponse<number, Error> => {
  return useSWRStatic('productNavWidth', initialData, { fallbackData: 320 });
};

export const useDrawerMode = (): SWRResponse<boolean, Error> => {
  const { data: editorMode } = useEditorMode();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();

  const condition = editorMode != null && isDeviceSmallerThanMd != null;

  const calcDrawerMode = (
      _keyString: string,
      editorMode: EditorMode,
      isDeviceSmallerThanMd: boolean,
  ): boolean => {
    return isDeviceSmallerThanMd
      ? true
      : editorMode === EditorMode.Editor;
  };

  return useSWRImmutable(
    condition ? ['isDrawerMode', editorMode, isDeviceSmallerThanMd] : null,
    // calcDrawerMode,
    key => calcDrawerMode(...key),
    condition
      ? {
        fallbackData: calcDrawerMode('isDrawerMode', editorMode, isDeviceSmallerThanMd),
      }
      : undefined,
  );
};

export const useDrawerOpened = (isOpened?: boolean): SWRResponse<boolean, Error> => {
  return useSWRStatic('isDrawerOpened', isOpened, { fallbackData: false });
};

export const useCollapsedMode = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useSWRStatic('isCollapsedMode', initialData, { fallbackData: false });
};

export const useCollapsedContentsOpened = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useSWRStatic('isCollapsedContentsOpened', initialData, { fallbackData: false });
};

export const useSidebarResizeDisabled = (isDisabled?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isSidebarResizeDisabled', isDisabled, { fallbackData: false });
};

export const useSelectedGrant = (initialData?: Nullable<IPageGrantData>): SWRResponse<Nullable<IPageGrantData>, Error> => {
  return useStaticSWR<Nullable<IPageGrantData>, Error>('selectedGrant', initialData, { fallbackData: { grant: PageGrant.GRANT_PUBLIC } });
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
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: isTrashPage } = useIsTrashPage();

  return useStaticSWR('isAbleToShowTrashPageManagementButtons', isTrashPage && currentUser != null && !isReadOnlyUser);
};

export const useIsAbleToShowPageManagement = (): SWRResponse<boolean, Error> => {
  const key = 'isAbleToShowPageManagement';
  const { data: currentPageId } = useCurrentPageId();
  const { data: _isTrashPage } = useIsTrashPage();
  const { data: _isSharedUser } = useIsSharedUser();
  const { data: isNotFound } = useIsNotFound();

  const pageId = currentPageId;
  const includesUndefined = [pageId, _isTrashPage, _isSharedUser, isNotFound].some(v => v === undefined);
  const isPageExist = (pageId != null) && isNotFound === false;
  const isEmptyPage = (pageId != null) && isNotFound === true;
  const isTrashPage = isPageExist && _isTrashPage === true;
  const isSharedUser = isPageExist && _isSharedUser === true;

  return useSWRImmutable(
    includesUndefined ? null : [key, pageId, isPageExist, isEmptyPage, isTrashPage, isSharedUser],
    ([, , isPageExist, isEmptyPage, isTrashPage, isSharedUser]) => (isPageExist && !isTrashPage && !isSharedUser) || isEmptyPage,
  );
};

export const useIsAbleToShowTagLabel = (): SWRResponse<boolean, Error> => {
  const key = 'isAbleToShowTagLabel';
  const { data: pageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isIdenticalPath } = useIsIdenticalPath();
  const { data: isNotFound } = useIsNotFound();
  const { data: editorMode } = useEditorMode();
  const { data: shareLinkId } = useShareLinkId();

  const includesUndefined = [currentPagePath, isIdenticalPath, isNotFound, editorMode].some(v => v === undefined);

  const isViewMode = editorMode === EditorMode.View;

  return useSWRImmutable(
    includesUndefined ? null : [key, pageId, currentPagePath, isIdenticalPath, isNotFound, editorMode, shareLinkId],
    // "/trash" page does not exist on page collection and unable to add tags
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => !isUsersTopPage(currentPagePath!) && !isTrashTopPage(currentPagePath!) && shareLinkId == null && !isIdenticalPath && !(isViewMode && isNotFound),
  );
};

export const useIsAbleToChangeEditorMode = (): SWRResponse<boolean, Error> => {
  const key = 'isAbleToChangeEditorMode';
  const { data: isEditable } = useIsEditable();
  const { data: isSharedUser } = useIsSharedUser();

  const includesUndefined = [isEditable, isSharedUser].some(v => v === undefined);

  return useSWRImmutable(
    includesUndefined ? null : [key, isEditable, isSharedUser],
    () => !!isEditable && !isSharedUser,
  );
};

export const useIsAbleToShowPageAuthors = (): SWRResponse<boolean, Error> => {
  const key = 'isAbleToShowPageAuthors';
  const { data: pageId } = useCurrentPageId();
  const { data: pagePath } = useCurrentPagePath();
  const { data: isNotFound } = useIsNotFound();

  const includesUndefined = [pageId, pagePath, isNotFound].some(v => v === undefined);
  const isPageExist = (pageId != null) && !isNotFound;
  const isUsersTopPagePath = pagePath != null && isUsersTopPage(pagePath);

  return useSWRImmutable(
    includesUndefined ? null : [key, pageId, pagePath, isNotFound],
    () => isPageExist && !isUsersTopPagePath,
  );
};
