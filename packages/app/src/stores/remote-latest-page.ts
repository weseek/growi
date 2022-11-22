import { SWRResponse } from 'swr';

import { useStaticSWR } from './use-static-swr';


export const useRemoteRevisionId = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR<string, Error>('remoteRevisionId', initialData);
};

export const useRemoteRevisionBody = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR<string, Error>('remoteRevisionId', initialData);
};
