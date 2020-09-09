import { Request } from 'express';

export interface CrowiRequest extends Request {

  user?: any,

  crowi: any,

}
