import { Ref } from '@growi/core';

import { SidebarContentsType } from './ui';
import { IUser } from './user';

export interface IUserUISettings {
  user: Ref<IUser> | null;
  isSidebarCollapsed: boolean,
  currentSidebarContents: SidebarContentsType,
  currentProductNavWidth: number,
  preferDrawerModeByUser: boolean,
  preferDrawerModeOnEditByUser: boolean,
}
