import { useMemo, useCallback } from 'react';

import type { IUserHasId } from '@growi/core';
import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

import { useRemoteRevisionBody, useRemoteRevisionId } from '~/states/page';

export const useRemoteRevisionLastUpdateUser = (initialData?: IUserHasId): SWRResponse<IUserHasId, Error> => {
  return useSWRStatic<IUserHasId, Error>('remoteRevisionLastUpdateUser', initialData);
};

export const useRemoteRevisionLastUpdatedAt = (initialData?: Date): SWRResponse<Date, Error> => {
  return useSWRStatic<Date, Error>('remoteRevisionLastUpdatedAt', initialData);
};

export type RemoteRevisionData = {
  remoteRevisionId: string,
  remoteRevisionBody: string,
  remoteRevisionLastUpdateUser?: IUserHasId,
  remoteRevisionLastUpdatedAt: Date,
}


// set remote data all at once
export const useSetRemoteLatestPageData = (): { setRemoteLatestPageData: (pageData: RemoteRevisionData) => void } => {
  const [, setRemoteRevisionId] = useRemoteRevisionId();
  const [, setRemoteRevisionBody] = useRemoteRevisionBody();
  const { mutate: mutateRemoteRevisionLastUpdateUser } = useRemoteRevisionLastUpdateUser();
  const { mutate: mutateRemoteRevisionLastUpdatedAt } = useRemoteRevisionLastUpdatedAt();

  const setRemoteLatestPageData = useCallback((remoteRevisionData: RemoteRevisionData) => {
    setRemoteRevisionId(remoteRevisionData.remoteRevisionId);
    setRemoteRevisionBody(remoteRevisionData.remoteRevisionBody);
    mutateRemoteRevisionLastUpdateUser(remoteRevisionData.remoteRevisionLastUpdateUser);
    mutateRemoteRevisionLastUpdatedAt(remoteRevisionData.remoteRevisionLastUpdatedAt);
  }, [mutateRemoteRevisionLastUpdateUser, mutateRemoteRevisionLastUpdatedAt, setRemoteRevisionBody, setRemoteRevisionId]);

  return useMemo(() => {
    return {
      setRemoteLatestPageData,
    };
  }, [setRemoteLatestPageData]);

};
