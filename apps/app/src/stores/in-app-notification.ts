import type { IUser, IPage } from '@growi/core';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';


import { SupportedTargetModel } from '~/interfaces/activity';
import type { InAppNotificationStatuses, IInAppNotification, PaginateResult } from '~/interfaces/in-app-notification';
import * as userSerializers from '~/models/serializers/in-app-notification-snapshot/user';
import loggerFactory from '~/utils/logger';

import { apiv3Get } from '../client/util/apiv3-client';

const logger = loggerFactory('growi:cli:InAppNotification');

type inAppNotificationPaginateResult = PaginateResult<IInAppNotification<IUser | IPage>>

export const useSWRxInAppNotifications = (
    limit: number,
    offset?: number,
    status?: InAppNotificationStatuses,
    config?: SWRConfiguration,
): SWRResponse<PaginateResult<IInAppNotification<IUser | IPage>>, Error> => {
  return useSWR(
    ['/in-app-notification/list', limit, offset, status],
    ([endpoint]) => apiv3Get(endpoint, { limit, offset, status }).then((response) => {
      const inAppNotificationPaginateResult = response.data as inAppNotificationPaginateResult;
      inAppNotificationPaginateResult.docs.forEach((doc) => {
        try {
          if (doc.targetModel === SupportedTargetModel.MODEL_USER) {
            doc.parsedSnapshot = userSerializers.parseSnapshot(doc.snapshot);
          }
          else {
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

export const useSWRxInAppNotificationStatus = (
): SWRResponse<number, Error> => {
  return useSWR(
    '/in-app-notification/status',
    endpoint => apiv3Get(endpoint).then(response => response.data.count),
  );
};
