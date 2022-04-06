export const SidebarContentsType = {
  CUSTOM: 'custom',
  RECENT: 'recent',
  TAG: 'tag',
} as const;
export const AllSidebarContentsType = Object.values(SidebarContentsType);
export type SidebarContentsType = typeof SidebarContentsType[keyof typeof SidebarContentsType];
