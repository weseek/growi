import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';

import { IUserHasId } from '~/interfaces/user';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxUsersList = <Data, Error>(userIds?: string[]): SWRResponse<IUserHasId[], Error> => {
  const distinctUserIds = userIds != null ? Array.from(new Set(userIds)).sort() : [];
  return useSWR(
    ['/users/list', distinctUserIds],
    endpoint => apiv3Get(endpoint, { userIds: distinctUserIds.join(',') }).then(response => response.data.users),
  );
};
