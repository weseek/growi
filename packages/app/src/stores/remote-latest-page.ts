import { SWRResponse } from 'swr';

import { IUser } from '~/interfaces/user';

import { useStaticSWR } from './use-static-swr';


export const useRemoteRevisionId = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR<string, Error>('remoteRevisionId', initialData);
};

export const useRemoteRevisionBody = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR<string, Error>('remoteRevisionBody', initialData);
};

export const useRemoteRevisionLastUpdatUser = (initialData?: IUser): SWRResponse<IUser, Error> => {
  return useStaticSWR<IUser, Error>('remoteRevisionLastUpdatUser', initialData);
};

export const useRemoteRevisionLastUpdatedAt = (initialData?: Date): SWRResponse<Date, Error> => {
  return useStaticSWR<Date, Error>('remoteRevisionLastUpdatedAt', initialData);
};


// set remote data all at once
export const useSetRemoteLatestPageData = (): { setRemoteLatestPageData: (pageData: any) => void } => {
  const { mutate: mutateRemoteRevisionId } = useRemoteRevisionId();
  const { mutate: mutateRemoteRevisionBody } = useRemoteRevisionBody();
  const { mutate: mutateRemoteRevisionLastUpdatUser } = useRemoteRevisionLastUpdatUser();
  const { mutate: mutateRemoteRevisionLastUpdatedAt } = useRemoteRevisionLastUpdatedAt();

  type RemoteRevisionData = {
    remoteRevisionId: string,
    remoteRevisionBody: string,
    remoteRevisionLastUpdatUser: IUser,
    remoteRevisionLastUpdatedAt: Date
  }

  const setRemoteLatestPageData = (remoteRevisionData: RemoteRevisionData) => {
    const {
      remoteRevisionId, remoteRevisionBody, remoteRevisionLastUpdatUser, remoteRevisionLastUpdatedAt,
    } = remoteRevisionData;
    mutateRemoteRevisionId(remoteRevisionId);
    mutateRemoteRevisionBody(remoteRevisionBody);
    mutateRemoteRevisionLastUpdatUser(remoteRevisionLastUpdatUser);
    mutateRemoteRevisionLastUpdatedAt(remoteRevisionLastUpdatedAt);
  };

  return {
    setRemoteLatestPageData,
  };

};
