import { SWRResponseWithUtils, withUtils } from '@growi/core';
import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';


import { apiv3Get, apiv3Put } from '../client/util/apiv3-client';
// import { IBookmarkInfo } from '../interfaces/bookmark-info';


type Util = {
  update(updateData: any): Promise<void>
};


export const useSWRxGlobalNotification = (globalNotificationId: string): SWRResponseWithUtils<Util, any, Error> => {
  const swrResult = useSWRImmutable(
    globalNotificationId != null ? `/notification-setting/global-notification/${globalNotificationId}` : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        globalNotification: response.data.globalNotification,
      };
    }),
  );


  const update = async(updateData) => {
    const { data, mutate } = swrResult;

    if (data == null) {
      return;
    }

    mutate({ ...data, ...updateData }, false);

    // invoke API
    await apiv3Put(`/notification-setting/global-notification/${globalNotificationId}`, updateData);
  };

  return withUtils<Util, any, Error>(swrResult, { update });
};
