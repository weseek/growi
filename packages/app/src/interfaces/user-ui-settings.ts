import { IUser } from './user';

import { SidebarContentsType } from './ui';
import { Ref } from './common';

export interface IUserUISettings {
  userId: Ref<IUser> | null;
  isSidebarCollapsed: boolean,
  currentSidebarContents: SidebarContentsType,
  currentProductNavWidth: number,
  preferDrawerModeByUser: boolean,
  preferDrawerModeOnEditByUser: boolean,
}
