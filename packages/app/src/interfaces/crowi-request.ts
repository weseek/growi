import { Request } from 'express';

import { IUserHasId } from './user';

export interface CrowiRequest extends Request {

  user?: IUserHasId,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  crowi: any,

  // provided by csurf
  csrfToken: () => string,

}
