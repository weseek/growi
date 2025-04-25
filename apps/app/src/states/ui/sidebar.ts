import { useEffect } from 'react';

import { atom, useAtom } from 'jotai';

import { scheduleToPut } from '~/client/services/user-ui-settings';
import { SidebarMode } from '~/interfaces/ui';
import { EditorMode } from '~/stores-universal/ui';

import { isDeviceLargerThanXlAtom } from './device';
import { editorModeAtom } from './editor';
import type { UseAtom } from './helper';


const isDrawerOpenedAtom = atom(false);

export const useDrawerOpened = (): UseAtom<typeof isDrawerOpenedAtom> => {
  return useAtom(isDrawerOpenedAtom);
};

const preferCollapsedModeAtom = atom(false);
// define a derived atom to call scheduleToPut when the value changes
const preferCollapsedModeAtomExt = atom(
  get => get(preferCollapsedModeAtom),
  (get, set, update: boolean) => {
    set(preferCollapsedModeAtom, update);
    scheduleToPut({ preferCollapsedModeByUser: update });
  },
);

export const usePreferCollapsedMode = (): UseAtom<typeof preferCollapsedModeAtom> => {
  return useAtom(preferCollapsedModeAtomExt);
};

// Initialize state from server-side props only once per session
const preferCollapsedModeInitializedAtom = atom(false);

export const usePreferCollapsedModeInitializer = (initialData: boolean): void => {
  const [isInitialized, setIsInitialized] = useAtom(preferCollapsedModeInitializedAtom);
  const [, setPreferCollapsedMode] = usePreferCollapsedMode();

  useEffect(() => {
    if (!isInitialized) {
      setPreferCollapsedMode(initialData);
      setIsInitialized(true);
    }
  }, [isInitialized, setPreferCollapsedMode, setIsInitialized, initialData]);
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
