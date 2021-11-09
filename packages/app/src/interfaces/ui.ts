export const SidebarContents = {
  CUSTOM: 'custom',
  RECENT: 'recent',
} as const;
export const AllSidebarContents = Object.values(SidebarContents);
export type SidebarContents = typeof SidebarContents[keyof typeof SidebarContents];
