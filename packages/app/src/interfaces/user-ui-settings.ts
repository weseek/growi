import { RefUsingLegacyHasObjectId } from './common';
import { SidebarContentsType } from './ui';
import { IUser } from './user';


export interface IUserUISettings {
  user: RefUsingLegacyHasObjectId<IUser> | null;
  isSidebarCollapsed: boolean,
  currentSidebarContents: SidebarContentsType,
  currentProductNavWidth: number,
  preferDrawerModeByUser: boolean,
  preferDrawerModeOnEditByUser: boolean,
}
