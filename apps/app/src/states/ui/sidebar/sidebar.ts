import { atom, useAtom } from 'jotai';

import { scheduleToPut } from '~/client/services/user-ui-settings';
import { SidebarContentsType, SidebarMode } from '~/interfaces/ui';
import { isDeviceLargerThanXlAtom } from '../device';
import { EditorMode } from '../editor';
import { editorModeAtom } from '../editor/atoms'; // import the atom directly

const isDrawerOpenedAtom = atom(false);

export const useDrawerOpened = () => {
  return useAtom(isDrawerOpenedAtom);
};

const preferCollapsedModeAtom = atom(false);
// define a derived atom to call scheduleToPut when the value changes
const preferCollapsedModeAtomExt = atom(
  (get) => get(preferCollapsedModeAtom),
  (get, set, update: boolean) => {
    set(preferCollapsedModeAtom, update);
    scheduleToPut({ preferCollapsedModeByUser: update });
  },
);

export const usePreferCollapsedMode = () => {
  return useAtom(preferCollapsedModeAtomExt);
};

// Collapsed contents opened state (temporary UI state, no persistence needed)
const isCollapsedContentsOpenedAtom = atom(false);

export const useCollapsedContentsOpened = () => {
  return useAtom(isCollapsedContentsOpenedAtom);
};

// Current sidebar contents state (with persistence)
const currentSidebarContentsAtom = atom<SidebarContentsType>(
  SidebarContentsType.TREE,
);
const currentSidebarContentsAtomExt = atom(
  (get) => get(currentSidebarContentsAtom),
  (get, set, update: SidebarContentsType) => {
    set(currentSidebarContentsAtom, update);
    scheduleToPut({ currentSidebarContents: update });
  },
);

export const useCurrentSidebarContents = () => {
  return useAtom(currentSidebarContentsAtomExt);
};

// Current product navigation width state (with persistence)
const currentProductNavWidthAtom = atom<number>(320);
const currentProductNavWidthAtomExt = atom(
  (get) => get(currentProductNavWidthAtom),
  (get, set, update: number) => {
    set(currentProductNavWidthAtom, update);
    scheduleToPut({ currentProductNavWidth: update });
  },
);

export const useCurrentProductNavWidth = () => {
  return useAtom(currentProductNavWidthAtomExt);
};

// Export base atoms for SSR hydration
export {
  preferCollapsedModeAtom,
  isCollapsedContentsOpenedAtom,
  currentSidebarContentsAtom,
  currentProductNavWidthAtom,
};

const sidebarModeAtom = atom((get) => {
  const isDeviceLargerThanXl = get(isDeviceLargerThanXlAtom);
  const editorMode = get(editorModeAtom);
  const isCollapsedModeUnderDockMode = get(preferCollapsedModeAtom);

  if (!isDeviceLargerThanXl) {
    return SidebarMode.DRAWER;
  }
  return editorMode === EditorMode.Editor || isCollapsedModeUnderDockMode
    ? SidebarMode.COLLAPSED
    : SidebarMode.DOCK;
});

type DetectSidebarModeUtils = {
  isDrawerMode(): boolean;
  isCollapsedMode(): boolean;
  isDockMode(): boolean;
};

export const useSidebarMode = (): {
  sidebarMode: SidebarMode;
} & DetectSidebarModeUtils => {
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
