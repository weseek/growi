import { SWRResponse } from 'swr';

type SWRResponseWithUtils<U, D = any, E = any> = SWRResponse<D, E> & U;

export const withUtils = <U, D = any, E = any>(response: SWRResponse<D, E>, utils: U): SWRResponseWithUtils<U, D, E> => {
  return Object.assign(response, utils);
};
