import { useMemo, useCallback } from 'react';

import type { IUser } from '@growi/core';
import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';


export const useRemoteRevisionId = (initialData?: string): SWRResponse<string, Error> => {
  return useSWRStatic<string, Error>('remoteRevisionId', initialData);
};

export const useRemoteRevisionBody = (initialData?: string): SWRResponse<string, Error> => {
  return useSWRStatic<string, Error>('remoteRevisionBody', initialData);
};

export const useRemoteRevisionLastUpdateUser = (initialData?: IUser): SWRResponse<IUser, Error> => {
  return useSWRStatic<IUser, Error>('remoteRevisionLastUpdateUser', initialData);
};

export const useRemoteRevisionLastUpdatedAt = (initialData?: Date): SWRResponse<Date, Error> => {
  return useSWRStatic<Date, Error>('remoteRevisionLastUpdatedAt', initialData);
};

type RemoteRevisionData = {
  remoteRevisionId: string,
  remoteRevisionBody: string,
  remoteRevisionLastUpdateUser: IUser,
  remoteRevisionLastUpdatedAt: Date,
}


// set remote data all at once
export const useSetRemoteLatestPageData = (): { setRemoteLatestPageData: (pageData: RemoteRevisionData) => void } => {
  const { mutate: mutateRemoteRevisionId } = useRemoteRevisionId();
  const { mutate: mutateRemoteRevisionBody } = useRemoteRevisionBody();
  const { mutate: mutateRemoteRevisionLastUpdateUser } = useRemoteRevisionLastUpdateUser();
  const { mutate: mutateRemoteRevisionLastUpdatedAt } = useRemoteRevisionLastUpdatedAt();

  const setRemoteLatestPageData = useCallback((remoteRevisionData: RemoteRevisionData) => {
    const {
      remoteRevisionId, remoteRevisionBody, remoteRevisionLastUpdateUser, remoteRevisionLastUpdatedAt,
    } = remoteRevisionData;
    mutateRemoteRevisionId(remoteRevisionId);
    mutateRemoteRevisionBody(remoteRevisionBody);
    mutateRemoteRevisionLastUpdateUser(remoteRevisionLastUpdateUser);
    mutateRemoteRevisionLastUpdatedAt(remoteRevisionLastUpdatedAt);
  }, [mutateRemoteRevisionBody, mutateRemoteRevisionId, mutateRemoteRevisionLastUpdateUser, mutateRemoteRevisionLastUpdatedAt]);

  return useMemo(() => {
    return {
      setRemoteLatestPageData,
    };
  }, [setRemoteLatestPageData]);

};
