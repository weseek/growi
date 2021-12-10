import { IUser } from './user';

import { SidebarContentsType } from './ui';

export interface IUserUISettings {
  user: IUser | string;
  isSidebarCollapsed: boolean,
  currentSidebarContents: SidebarContentsType,
  currentProductNavWidth: number,
  preferDrawerModeByUser: boolean,
  preferDrawerModeOnEditByUser: boolean,
}
