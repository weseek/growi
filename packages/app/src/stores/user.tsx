import useSWR, { SWRResponse } from 'swr';
import { apiv3Get } from '~/client/util/apiv3-client';

import { IUserHasId } from '~/interfaces/user';

import { checkAndUpdateImageUrlCached } from '~/stores/middlewares/user';

import { apiGet } from '../client/util/apiv1-client';

export const useSWRxLikerList = (likerIds: string[] = []): SWRResponse<IUserHasId[], Error> => {
  const shouldFetch = likerIds.length > 0;
  return useSWR(shouldFetch ? ['/users.list', [...likerIds].join(',')] : null, (endpoint:string, userIds:string) => {
    return apiGet(endpoint, { user_ids: userIds }).then((response:any) => response.users);
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxUsersList = <Data, Error>(userIds: string[]): SWRResponse<IUserHasId[], Error> => {
  const distinctUserIds = userIds.length > 0 ? Array.from(new Set(userIds)).sort() : [];
  return useSWR(
    distinctUserIds.length > 0 ? ['/users/list', distinctUserIds] : null,
    (endpoint, userIds) => apiv3Get(endpoint, { userIds: userIds.join(',') }).then((response) => {
      return response.data.users;
    }),
    { use: [checkAndUpdateImageUrlCached] },
  );
};
