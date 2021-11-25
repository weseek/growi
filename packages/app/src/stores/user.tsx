import useSWR, { SWRResponse } from 'swr';
import { IUser } from '../interfaces/user';
import { apiGet } from '../client/util/apiv1-client';

const userFetcher = (endpoint:string, ids:string) => {
  return apiGet(endpoint, { user_ids: ids }).then((response:any) => response.users);
};

export const useSWRxLikerList = (likerIds?: string[]): SWRResponse<IUser[], Error> => {
  const shouldFetch = likerIds != null && likerIds.length > 0;
  return useSWR<any>(shouldFetch ? ['/users.list', [...likerIds].join(',')] : null, userFetcher);
};
