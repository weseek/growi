import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '../client/util/apiv3-client';
import { IInAppNotification } from '../interfaces/in-app-notification';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxInAppNotifications = <Data, Error>(
  limit: number,
): SWRResponse<any, Error> => {
  return useSWR(
    '/in-app-notification/list',
    // endpoint => apiv3Get<{ notifications: IInAppNotification[], limit: number }>(endpoint).then(response => response.data?.notifications),
    endpoint => apiv3Get(endpoint, { limit }).then(response => response.data),
  );
};
