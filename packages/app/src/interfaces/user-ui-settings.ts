import { IUser } from './user';

import { SidebarContents } from './ui';

export interface IUserUISettings {
  userId: IUser | string;
  isSidebarCollapsed: boolean,
  selectedSidebarContents: SidebarContents,
  currentProductNavWidth: number,
}
