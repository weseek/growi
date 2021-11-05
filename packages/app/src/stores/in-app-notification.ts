import useSWR, { SWRResponse } from 'swr';

import { PaginateResult } from 'mongoose';
import { apiv3Get } from '../client/util/apiv3-client';
import { IInAppNotification } from '../interfaces/in-app-notification';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxInAppNotifications = <Data, Error>(
  limit: number,
): SWRResponse<PaginateResult<IInAppNotification>, Error> => {
  return useSWR(
    '/in-app-notification/list',
    endpoint => apiv3Get(endpoint, { limit }).then(response => response.data),
  );
};
