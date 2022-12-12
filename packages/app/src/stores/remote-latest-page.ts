import { SWRResponse } from 'swr';

import { IUser } from '~/interfaces/user';

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
  remoteRevisionLastUpdatedAt: Date
}


// set remote data all at once
export const useSetRemoteLatestPageData = (): { setRemoteLatestPageData: (pageData: RemoteRevisionData) => void } => {
  const { mutate: mutateRemoteRevisionId } = useRemoteRevisionId();
  const { mutate: mutateRemoteRevisionBody } = useRemoteRevisionBody();
  const { mutate: mutateRemoteRevisionLastUpdateUser } = useRemoteRevisionLastUpdateUser();
  const { mutate: mutateRemoteRevisionLastUpdatedAt } = useRemoteRevisionLastUpdatedAt();

  const setRemoteLatestPageData = (remoteRevisionData: RemoteRevisionData) => {
    const {
      remoteRevisionId, remoteRevisionBody, remoteRevisionLastUpdateUser, remoteRevisionLastUpdatedAt,
    } = remoteRevisionData;
    mutateRemoteRevisionId(remoteRevisionId);
    mutateRemoteRevisionBody(remoteRevisionBody);
    mutateRemoteRevisionLastUpdateUser(remoteRevisionLastUpdateUser);
    mutateRemoteRevisionLastUpdatedAt(remoteRevisionLastUpdatedAt);
  };

  return {
    setRemoteLatestPageData,
  };

};
