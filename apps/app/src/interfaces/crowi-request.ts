import { Request } from 'express';

import { IUser, IUserHasId } from './user';

export interface CrowiRequest<U extends IUser = IUserHasId> extends Request {

  user?: U,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  crowi: any,

  session: any,

  // provided by csurf
  csrfToken: () => string,

}
