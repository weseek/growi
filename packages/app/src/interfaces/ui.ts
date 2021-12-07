export const SidebarContentsType = {
  CUSTOM: 'custom',
  RECENT: 'recent',
  TREE: 'tree',
} as const;
export const AllSidebarContentsType = Object.values(SidebarContentsType);
export type SidebarContentsType = typeof SidebarContentsType[keyof typeof SidebarContentsType];
