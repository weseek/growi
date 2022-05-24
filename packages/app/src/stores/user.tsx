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

type usernameResponse = {
  data: {
    activeUsernames?: string[]
    inactiveUsernames?: string[]
    activitySnapshotUsernames?: string[]
  }
}

export const useSWRxUsernames = (
    q: string,
    limit?: number,
    isIncludeActiveUsernames?: boolean,
    isIncludeInactiveUsernames?: boolean,
    isIncludeActivitySnapshotUsernames?: boolean,
): SWRResponse<usernameResponse, Error> => {
  return useSWRImmutable(
    q != null ? ['/users/usernames', q, limit, isIncludeActiveUsernames, isIncludeInactiveUsernames, isIncludeActivitySnapshotUsernames] : null,
    (
        endpoint,
        q,
        limit,
        isIncludeActiveUsernames,
        isIncludeInactiveUsernames,
        isIncludeActivitySnapshotUsernames,
    ) => apiv3Get(endpoint, {
      q, limit, isIncludeActiveUsernames, isIncludeInactiveUsernames, isIncludeActivitySnapshotUsernames,
    }).then(result => result.data),
  );
};
