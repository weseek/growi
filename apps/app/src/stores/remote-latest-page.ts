import { useMemo, useCallback } from 'react';

import type { IUserHasId } from '@growi/core';
import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

export const useRemoteRevisionLastUpdateUser = (initialData?: IUserHasId): SWRResponse<IUserHasId, Error> => {
  return useSWRStatic<IUserHasId, Error>('remoteRevisionLastUpdateUser', initialData);
};

export const useRemoteRevisionLastUpdatedAt = (initialData?: Date): SWRResponse<Date, Error> => {
  return useSWRStatic<Date, Error>('remoteRevisionLastUpdatedAt', initialData);
};

export type RemoteRevisionData = {
  remoteRevisionLastUpdateUser?: IUserHasId,
  remoteRevisionLastUpdatedAt: Date,
}


// set remote data all at once
export const useSetRemoteLatestPageData = (): { setRemoteLatestPageData: (pageData: RemoteRevisionData) => void } => {
  const { mutate: mutateRemoteRevisionLastUpdateUser } = useRemoteRevisionLastUpdateUser();
  const { mutate: mutateRemoteRevisionLastUpdatedAt } = useRemoteRevisionLastUpdatedAt();

  const setRemoteLatestPageData = useCallback((remoteRevisionData: RemoteRevisionData) => {
    const {
      remoteRevisionLastUpdateUser, remoteRevisionLastUpdatedAt,
    } = remoteRevisionData;
    mutateRemoteRevisionLastUpdateUser(remoteRevisionLastUpdateUser);
    mutateRemoteRevisionLastUpdatedAt(remoteRevisionLastUpdatedAt);
  }, [mutateRemoteRevisionLastUpdateUser, mutateRemoteRevisionLastUpdatedAt]);

  return useMemo(() => {
    return {
      setRemoteLatestPageData,
    };
  }, [setRemoteLatestPageData]);

};
