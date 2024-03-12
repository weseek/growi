import type { ErrorV3 } from '@growi/core/dist/models';
import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

import { PageUpdateErrorCode } from '~/interfaces/apiv3';
import { type RemoteRevisionData } from '~/stores/remote-latest-page';

export const extractRemoteRevisionDataFromErrorObj = (errors: Array<ErrorV3>): RemoteRevisionData | undefined => {
  for (const error of errors) {
    if (error.code === PageUpdateErrorCode.CONFLICT) {

      const latestRevision = error.args.returnLatestRevision;

      const remoteRevidsionData = {
        remoteRevisionId: latestRevision.revisionId,
        remoteRevisionBody: latestRevision.revisionBody,
        remoteRevisionLastUpdateUser: latestRevision.user,
        remoteRevisionLastUpdatedAt: latestRevision.createdAt,
      };

      return remoteRevidsionData;
    }
  }
};

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
