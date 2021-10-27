import { mutate, SWRResponse } from 'swr';

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

export const useCurrentSidebarContents = <Data, Error>(sidebarContents?: SidebarContents): SWRResponse<SidebarContents, Error> => {
  return useStaticSWR('sidebarContents', sidebarContents || null, { fallbackData: SidebarContents.RECENT });
};


// export const useCurrentProductNavWidth = (productNavWidth?: number): SWRResponse<number, any> => {
//   const key = 'productNavWidth';
//   const sidebarDefaultWidth = 320;

//   if (productNavWidth == null) {
//     if (!cache.has(key)) {
//       mutate(key, sidebarDefaultWidth, false);
//     }
//   }
//   else {
//     mutate(key, productNavWidth);
//   }

//   return useStaticSWR(key);
// };

// export const useSidebarCollapsed = (isCollapsed?: boolean): SWRResponse<boolean, any> => {
//   const key = 'isSidebarCollapsed';

//   if (isCollapsed == null) {
//     if (!cache.has(key)) {
//       mutate(key, false, false);
//     }
//   }
//   else {
//     mutate(key, isCollapsed);
//   }

//   return useStaticSWR(key);
// };

// export const useSidebarResizeDisabled = (isDisabled?: boolean): SWRResponse<boolean, any> => {
//   const key = 'isSidebarResizeDisabled';

//   if (isDisabled == null) {
//     if (!cache.has(key)) {
//       mutate(key, false, false);
//     }
//   }
//   else {
//     mutate(key, isDisabled);
//   }

//   return useStaticSWR(key);
// };
