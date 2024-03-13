import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

/*
* PageStatusAlert
*/
type PageStatusAlertStatus = {
  onConflict?: () => void,
}

type PageStatusAlertUtils = {
  storeMethods: (conflictHandler: () => void) => void,
  clearMethods: () => void,
}
export const usePageStatusAlert = (): SWRResponse<PageStatusAlertStatus, Error> & PageStatusAlertUtils => {
  const swrResponse = useSWRStatic<PageStatusAlertStatus, Error>('pageStatusAlert', undefined);

  return {
    ...swrResponse,
    storeMethods(onConflict) {
      swrResponse.mutate({ onConflict });
    },
    clearMethods() {
      swrResponse.mutate({});
    },
  };
};
