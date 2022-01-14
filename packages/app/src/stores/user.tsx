import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';

import { IUserHasId } from '~/interfaces/user';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxUsersList = <Data, Error>(userIds?: string): SWRResponse<IUserHasId[], Error> => {
  return useSWR(
    ['/users/list', userIds],
    (endpoint, userIds) => apiv3Get(endpoint, { userIds }).then(response => response.data.users),
  );
};
