import type { IUser } from '@growi/core';
import type { Request } from 'express';
import type { HydratedDocument } from 'mongoose';


export interface CrowiProperties {

  user?: HydratedDocument<IUser>,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  crowi: any,

  session: any,

  // provided by csurf
  csrfToken: () => string,

}

export interface CrowiRequest extends CrowiProperties, Request {}
