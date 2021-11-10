import { SWRConfiguration } from 'swr';


export const swrGlobalConfiguration: SWRConfiguration = {
  fetcher: null,
  revalidateOnFocus: false,
  errorRetryCount: 1,
};
