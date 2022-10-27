import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '../client/util/apiv3-client';
// import { IBookmarkInfo } from '../interfaces/bookmark-info';


export const useSWRxGlobalNotification = (globalNotificationId: string): SWRResponse<any, Error> => {
  return useSWRImmutable(
    globalNotificationId != null ? `/notification-setting/global-notification/${globalNotificationId}` : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        globalNotification: response.data.globalNotification,
      };
    }),
  );
};
