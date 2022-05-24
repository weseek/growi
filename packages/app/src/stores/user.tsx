import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IUserHasId } from '~/interfaces/user';
import { checkAndUpdateImageUrlCached } from '~/stores/middlewares/user';

export const useSWRxUsersList = (userIds: string[]): SWRResponse<IUserHasId[], Error> => {
  const distinctUserIds = userIds.length > 0 ? Array.from(new Set(userIds)).sort() : [];
  return useSWR(
    distinctUserIds.length > 0 ? ['/users/list', distinctUserIds] : null,
    (endpoint, userIds) => apiv3Get(endpoint, { userIds: userIds.join(',') }).then((response) => {
      return response.data.users;
    }),
    { use: [checkAndUpdateImageUrlCached] },
  );
};

type usernameOptions = {
  isIncludeActiveUsernames?: boolean,
  isIncludeInactiveUsernames?: boolean,
  isIncludeActivitySnapshotUsernames?: boolean,
}

type usernameResponse = {
  data: {
    activeUsernames?: string[]
    inactiveUsernames?: string[]
    activitySnapshotUsernames?: string[]
  }
}

export const useSWRxUsernames = (q: string, limit?: number, options?: usernameOptions): SWRResponse<usernameResponse, Error> => {
  return useSWRImmutable(
    q != null ? ['/users/usernames', q, limit, options] : null,
    (endpoint, q, limit, options) => apiv3Get(endpoint, { q, limit, options: JSON.stringify(options) }).then(result => result.data),
  );
};
