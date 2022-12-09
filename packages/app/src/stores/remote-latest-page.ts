import { SWRResponse } from 'swr';

import { IUser } from '~/interfaces/user';

import { useStaticSWR } from './use-static-swr';


export const useRemoteRevisionId = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR<string, Error>('remoteRevisionId', initialData);
};

export const useRemoteRevisionBody = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR<string, Error>('remoteRevisionId', initialData);
};

export const useRemoteRevisionLastUpdatUser = (initialData?: IUser): SWRResponse<IUser, Error> => {
  return useStaticSWR<IUser, Error>('remoteRevisionLastUpdatUser', initialData);
};

export const useRemoteRevisionLastUpdatedAt = (initialData?: Date): SWRResponse<Date, Error> => {
  return useStaticSWR<Date, Error>('remoteRevisionLastUpdatedAt', initialData);
};
