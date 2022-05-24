import useSWR, { SWRResponse } from 'swr';

import { apiGet } from '~/client/util/apiv1-client';

import { Nullable } from '../interfaces/common';

import { useStaticSWR } from './use-static-swr';

export const useIsSlackEnabled = (isEnabled?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isSlackEnabled', isEnabled, { fallbackData: false });
};

export const useSWRxSlackChannels = (path: string): SWRResponse<Nullable<string[]>, Error> => {
  const shouldFetch: boolean = path != null;
  return useSWR(
    shouldFetch ? ['/pages.updatePost', path] : null,
    (endpoint, path) => apiGet(endpoint, { path }).then(response => response.updatePost),
  );
};
