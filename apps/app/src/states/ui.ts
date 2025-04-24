import { useEffect } from 'react';


import { isClient } from '@growi/core/dist/utils';
import { Breakpoint } from '@growi/ui/dist/interfaces';
import { addBreakpointListener, cleanupBreakpointListener } from '@growi/ui/dist/utils';
import { atom, useAtom } from 'jotai';

import { SidebarMode } from '~/interfaces/ui';
import { EditorMode } from '~/stores-universal/ui';

const isDrawerOpenedAtom = atom<boolean>(false);

export const useDrawerOpened = () => {
  return useAtom(isDrawerOpenedAtom);
};


const preferCollapsedModeAtom = atom<boolean>(false);

export const usePreferCollapsedMode = () => {
  return useAtom(preferCollapsedModeAtom);
};


// Device state atoms
const isDeviceLargerThanXlAtom = atom<boolean>(false);

export const useDeviceLargerThanXl = () => {
  const [isLargerThanXl, setIsLargerThanXl] = useAtom(isDeviceLargerThanXlAtom);

  useEffect(() => {
    if (isClient()) {
      const xlOrAboveHandler = function(this: MediaQueryList): void {
        // lg -> xl: matches will be true
        // xl -> lg: matches will be false
        setIsLargerThanXl(this.matches);
      };
      const mql = addBreakpointListener(Breakpoint.XL, xlOrAboveHandler);

      // initialize
      setIsLargerThanXl(mql.matches);

      return () => {
        cleanupBreakpointListener(mql, xlOrAboveHandler);
      };
    }
    return undefined;
  }, [setIsLargerThanXl]);

  return [isLargerThanXl, setIsLargerThanXl] as const;
};


const editorModeAtom = atom<EditorMode>(EditorMode.View);

export const useEditorModeState = () => {
  return useAtom(editorModeAtom);
};


// Sidebar mode atom
const sidebarModeAtom = atom(
  (get) => {
    const isDeviceLargerThanXl = get(isDeviceLargerThanXlAtom);
    const editorMode = get(editorModeAtom);
    const isCollapsedModeUnderDockMode = get(preferCollapsedModeAtom);

    if (!isDeviceLargerThanXl) {
      return SidebarMode.DRAWER;
    }
    return (editorMode === EditorMode.Editor || isCollapsedModeUnderDockMode)
      ? SidebarMode.COLLAPSED
      : SidebarMode.DOCK;
  },
);

type DetectSidebarModeUtils = {
  isDrawerMode(): boolean
  isCollapsedMode(): boolean
  isDockMode(): boolean
}

export const useSidebarMode = (): { sidebarMode: SidebarMode } & DetectSidebarModeUtils => {
  const [sidebarMode] = useAtom(sidebarModeAtom);

  const isDrawerMode = () => sidebarMode === SidebarMode.DRAWER;
  const isCollapsedMode = () => sidebarMode === SidebarMode.COLLAPSED;
  const isDockMode = () => sidebarMode === SidebarMode.DOCK;

  return {
    sidebarMode,
    isDrawerMode,
    isCollapsedMode,
    isDockMode,
  };
};
