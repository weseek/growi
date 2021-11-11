import { SWRConfiguration } from 'swr';


export const swrGlobalConfiguration: SWRConfiguration = {
  fetcher: undefined,
  revalidateOnFocus: false,
  errorRetryCount: 1,
};
