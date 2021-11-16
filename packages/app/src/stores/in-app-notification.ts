import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '../client/util/apiv3-client';
import { IInAppNotification, PaginateResult } from '../interfaces/in-app-notification';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxInAppNotifications = <Data, Error>(
  limit: number,
  offset?: number,
): SWRResponse<PaginateResult<IInAppNotification>, Error> => {
  return useSWR(
    ['/in-app-notification/list', limit, offset],
    endpoint => apiv3Get(endpoint, { limit, offset }).then(response => response.data),
  );
};
