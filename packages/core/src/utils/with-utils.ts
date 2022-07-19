import { SWRResponse } from 'swr';

export type SWRResponseWithUtils<R extends SWRResponse, U> = R & U;

export const withUtils = <R extends SWRResponse, U>(response: R, utils: U): SWRResponseWithUtils<R, U> => {
  return Object.assign(response, utils);
};
