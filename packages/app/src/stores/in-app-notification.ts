import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '../client/util/apiv3-client';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxInAppNotifications = <Data, Error>(
  limit: number,
  offset?: number,
// TODO: import @types/mongoose-paginate-v2 and use PaginateResult as a type after upgrading mongoose v6.0.0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): SWRResponse<any, Error> => {
  return useSWR(
    ['/in-app-notification/list', limit, offset],
    endpoint => apiv3Get(endpoint, { limit, offset }).then(response => response.data),
  );
};
