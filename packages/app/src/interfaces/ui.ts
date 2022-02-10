export const SidebarContentsType = {
  CUSTOM: 'custom',
  RECENT: 'recent',
  TREE: 'tree',
  TAG: 'tag',
} as const;
export const AllSidebarContentsType = Object.values(SidebarContentsType);
export type SidebarContentsType = typeof SidebarContentsType[keyof typeof SidebarContentsType];


export type ICustomTabContent = {
  Content: () => JSX.Element,
  i18n: string,
  Icon?: () => JSX.Element,
  index?: number,
  isLinkEnabled?: boolean | ((content: ICustomTabContent) => boolean),
};

export type ICustomNavTabMappings = { [key: string]: ICustomTabContent };
