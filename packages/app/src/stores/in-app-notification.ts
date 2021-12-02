import useSWR, { SWRResponse } from 'swr';
import { InAppNotificationStatuses, IInAppNotification, PaginateResult } from '~/interfaces/in-app-notification';
import { apiv3Get } from '../client/util/apiv3-client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxInAppNotifications = <Data, Error>(
  limit: number,
  offset?: number,
  status?: InAppNotificationStatuses,
): SWRResponse<PaginateResult<IInAppNotification>, Error> => {
  return useSWR(
    ['/in-app-notification/list', limit, offset, status],
    endpoint => apiv3Get(endpoint, { limit, offset, status }).then(response => response.data),
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxInAppNotificationStatus = <Data, Error>(
): SWRResponse<number, Error> => {
  return useSWR(
    ['/in-app-notification/status'],
    endpoint => apiv3Get(endpoint).then(response => response.data.count),
  );
};
