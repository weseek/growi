import type { SidebarContentsType } from './ui';

export interface IUserUISettings {
  currentSidebarContents: SidebarContentsType,
  currentPageControlsRect: DOMRect,
  currentProductNavWidth: number,
  preferCollapsedModeByUser: boolean,
}
