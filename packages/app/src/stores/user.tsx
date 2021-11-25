import useSWR, { SWRResponse } from 'swr';
import { IUser } from '../interfaces/user';
import { apiGet } from '../client/util/apiv1-client';

const userFetcher = (endpoint:string, userIds:string) => {
  return apiGet(endpoint, { user_ids: userIds }).then((response:any) => response.users);
};

export const useSWRxLikerList = (likerIds?: string[]): SWRResponse<IUser[], Error> => {
  const shouldFetch = likerIds != null && likerIds.length > 0;
  return useSWR(shouldFetch ? ['/users.list', [...likerIds].join(',')] : null, userFetcher);
};
