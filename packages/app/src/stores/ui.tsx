import { SWRResponse } from 'swr';

import loggerFactory from '~/utils/logger';

import { useStaticSWR } from './use-static-swr';

const logger = loggerFactory('growi:stores:ui');


/** **********************************************************
 *                          Unions
 *********************************************************** */

export const SidebarContents = {
  CUSTOM: 'custom',
  RECENT: 'recent',
} as const;
export type SidebarContents = typeof SidebarContents[keyof typeof SidebarContents];


/** **********************************************************
 *                          SWR Hooks
 *                      for switching UI
 *********************************************************** */

export const useCurrentSidebarContents = (sidebarContents?: SidebarContents): SWRResponse<SidebarContents, Error> => {
  const initialData = SidebarContents.RECENT;
  return useStaticSWR('sidebarContents', sidebarContents || null, { fallbackData: initialData });
};


export const useCurrentProductNavWidth = (productNavWidth?: number): SWRResponse<number, Error> => {
  const initialData = 320;
  return useStaticSWR('productNavWidth', productNavWidth || null, { fallbackData: initialData });
};

export const useSidebarCollapsed = (isCollapsed?: boolean): SWRResponse<boolean, Error> => {
  const initialData = false;
  return useStaticSWR('isSidebarCollapsed', isCollapsed || null, { fallbackData: initialData });
};

export const useSidebarResizeDisabled = (isDisabled?: boolean): SWRResponse<boolean, Error> => {
  const initialData = false;
  return useStaticSWR('isSidebarResizeDisabled', isDisabled || null, { fallbackData: initialData });
};
