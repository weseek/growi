import useSWR, { SWRResponse } from 'swr';

import { toastWarning } from '~/client/util/toastr';
import type { InAppNotificationStatuses, IInAppNotification, PaginateResult } from '~/interfaces/in-app-notification';
import { parseSnapshot } from '~/models/serializers/in-app-notification-snapshot/page';

import { apiv3Get } from '../client/util/apiv3-client';

type inAppNotificationPaginateResult = PaginateResult<IInAppNotification>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxInAppNotifications = <Data, Error>(
  limit: number,
  offset?: number,
  status?: InAppNotificationStatuses,
): SWRResponse<PaginateResult<IInAppNotification>, Error> => {
  return useSWR(
    ['/in-app-notification/list', limit, offset, status],
    endpoint => apiv3Get(endpoint, { limit, offset, status }).then((response) => {
      const inAppNotificationPaginateResult = response.data as inAppNotificationPaginateResult;
      inAppNotificationPaginateResult.docs.forEach((doc) => {
        try {
          doc.snapshot = parseSnapshot(doc.snapshot as string);
        }
        catch (err) {
          toastWarning(err);
        }
      });
      return inAppNotificationPaginateResult;
    }),
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
