import { SWRResponse } from '../index';

export type SWRResponseWithUtils<R extends SWRResponse, Utils> = R & Utils;

export const withUtils = <R extends SWRResponse, U>(response: R, utils: U): SWRResponseWithUtils<R, U> => {
  return Object.assign(response, utils);
};
