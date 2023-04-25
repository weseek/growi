import { USER_STATUS } from '~/interfaces/user';
import type { IUserStatus } from '~/interfaces/user';

export const createRedirectToForUnauthenticated = (userStatus: IUserStatus): string | null => {
  switch (userStatus) {
    case USER_STATUS.REGISTERED:
      return '/login/error/registered';
    case USER_STATUS.SUSPENDED:
      return '/login/error/suspended';
    case USER_STATUS.INVITED:
      return '/invited';
    case USER_STATUS.DELETED:
      return '/login';
    default:
      return null;
  }
};
