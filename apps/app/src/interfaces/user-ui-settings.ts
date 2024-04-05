import type { SidebarContentsType } from './ui';

export interface IUserUISettings {
  currentSidebarContents: SidebarContentsType,
  currentPageControlsX: number,
  currentProductNavWidth: number,
  preferCollapsedModeByUser: boolean,
}
