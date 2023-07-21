import { useMemo, useCallback } from 'react';

import type { IUser } from '@growi/core/dist/interfaces';
import { SWRResponse } from 'swr';


import { useRevisionIdHackmdSynced, useHasDraftOnHackmd } from './hackmd';
import { useStaticSWR } from './use-static-swr';


export const useRemoteRevisionId = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR<string, Error>('remoteRevisionId', initialData);
};

export const useRemoteRevisionBody = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR<string, Error>('remoteRevisionBody', initialData);
};

export const useRemoteRevisionLastUpdateUser = (initialData?: IUser): SWRResponse<IUser, Error> => {
  return useStaticSWR<IUser, Error>('remoteRevisionLastUpdateUser', initialData);
};

export const useRemoteRevisionLastUpdatedAt = (initialData?: Date): SWRResponse<Date, Error> => {
  return useStaticSWR<Date, Error>('remoteRevisionLastUpdatedAt', initialData);
};

type RemoteRevisionData = {
  remoteRevisionId: string,
  remoteRevisionBody: string,
  remoteRevisionLastUpdateUser: IUser,
  remoteRevisionLastUpdatedAt: Date,
  revisionIdHackmdSynced: string,
  hasDraftOnHackmd: boolean,
}


// set remote data all at once
export const useSetRemoteLatestPageData = (): { setRemoteLatestPageData: (pageData: RemoteRevisionData) => void } => {
  const { mutate: mutateRemoteRevisionId } = useRemoteRevisionId();
  const { mutate: mutateRemoteRevisionBody } = useRemoteRevisionBody();
  const { mutate: mutateRemoteRevisionLastUpdateUser } = useRemoteRevisionLastUpdateUser();
  const { mutate: mutateRemoteRevisionLastUpdatedAt } = useRemoteRevisionLastUpdatedAt();
  const { mutate: mutateRevisionIdHackmdSynced } = useRevisionIdHackmdSynced();
  const { mutate: mutateHasDraftOnHackmd } = useHasDraftOnHackmd();

  const setRemoteLatestPageData = useCallback((remoteRevisionData: RemoteRevisionData) => {
    const {
      remoteRevisionId, remoteRevisionBody, remoteRevisionLastUpdateUser, remoteRevisionLastUpdatedAt, revisionIdHackmdSynced, hasDraftOnHackmd,
    } = remoteRevisionData;
    mutateRemoteRevisionId(remoteRevisionId);
    mutateRemoteRevisionBody(remoteRevisionBody);
    mutateRemoteRevisionLastUpdateUser(remoteRevisionLastUpdateUser);
    mutateRemoteRevisionLastUpdatedAt(remoteRevisionLastUpdatedAt);
    mutateRevisionIdHackmdSynced(revisionIdHackmdSynced);
    mutateHasDraftOnHackmd(hasDraftOnHackmd);
  // eslint-disable-next-line max-len
  }, [mutateHasDraftOnHackmd, mutateRemoteRevisionBody, mutateRemoteRevisionId, mutateRemoteRevisionLastUpdateUser, mutateRemoteRevisionLastUpdatedAt, mutateRevisionIdHackmdSynced]);

  return useMemo(() => {
    return {
      setRemoteLatestPageData,
    };
  }, [setRemoteLatestPageData]);

};
