import { atom, useAtom } from 'jotai';

// Private atoms
const isDrawerOpenedAtom = atom<boolean>(false);
const preferCollapsedModeAtom = atom<boolean>(false);

// Public hooks
export const useDrawerOpened = () => {
  return useAtom(isDrawerOpenedAtom);
};

export const usePreferCollapsedMode = () => {
  return useAtom(preferCollapsedModeAtom);
};
