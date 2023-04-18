import useSWR, { SWRConfiguration, SWRResponse } from 'swr';

import type { InAppNotificationStatuses, IInAppNotification, PaginateResult } from '~/interfaces/in-app-notification';
import * as pageSerializers from '~/models/serializers/in-app-notification-snapshot/page';
import * as userSerializers from '~/models/serializers/in-app-notification-snapshot/user';
import loggerFactory from '~/utils/logger';

import { apiv3Get } from '../client/util/apiv3-client';

const logger = loggerFactory('growi:cli:InAppNotification');

type inAppNotificationPaginateResult = PaginateResult<IInAppNotification>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxInAppNotifications = <Data, Error>(
  limit: number,
  offset?: number,
  status?: InAppNotificationStatuses,
  config?: SWRConfiguration,
): SWRResponse<PaginateResult<IInAppNotification>, Error> => {
  return useSWR(
    ['/in-app-notification/list', limit, offset, status],
    ([endpoint]) => apiv3Get(endpoint, { limit, offset, status }).then((response) => {
      const inAppNotificationPaginateResult = response.data as inAppNotificationPaginateResult;
      inAppNotificationPaginateResult.docs.forEach((doc) => {
        try {
          switch (doc.targetModel) {
            case 'Page':
              doc.parsedSnapshot = pageSerializers.parseSnapshot(doc.snapshot);
              break;
            case 'User':
              doc.parsedSnapshot = userSerializers.parseSnapshot(doc.snapshot);
              break;
            default:
              throw new Error(`No serializer found for targetModel: ${doc.targetModel}`);
          }
        }
        catch (err) {
          logger.warn('Failed to parse snapshot', err);
        }
      });
      return inAppNotificationPaginateResult;
    }),
    config,
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxInAppNotificationStatus = <Data, Error>(
): SWRResponse<number, Error> => {
  return useSWR(
    '/in-app-notification/status',
    endpoint => apiv3Get(endpoint).then(response => response.data.count),
  );
};
