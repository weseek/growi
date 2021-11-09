import { IUser } from './user';

import { SidebarContentsType } from './ui';

export interface IUserUISettings {
  userId: IUser | string;
  isSidebarCollapsed: boolean,
  currentSidebarContents: SidebarContentsType,
  currentProductNavWidth: number,
}
