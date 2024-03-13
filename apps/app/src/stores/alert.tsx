import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

/*
* PageStatusAlert
*/
type PageStatusAlertMethods = {
  onResolveConflict?: () => void,
}

type PageStatusAlertUtils = {
  storeMethods: (methods: PageStatusAlertMethods) => void,
  clearMethods: () => void,
}
export const usePageStatusAlert = (): SWRResponse<PageStatusAlertMethods, Error> & PageStatusAlertUtils => {
  const swrResponse = useSWRStatic<PageStatusAlertMethods, Error>('pageStatusAlert', undefined);

  return {
    ...swrResponse,
    storeMethods(methods) {
      swrResponse.mutate(methods);
    },
    clearMethods() {
      swrResponse.mutate({});
    },
  };
};
