import { SidebarContentsType } from './ui';

export interface IUserUISettings {
  isSidebarCollapsed: boolean,
  currentSidebarContents: SidebarContentsType,
  currentProductNavWidth: number,
  preferDrawerModeByUser: boolean,
  preferDrawerModeOnEditByUser: boolean,
}
