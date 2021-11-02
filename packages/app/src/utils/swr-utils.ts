import { SWRConfiguration } from 'swr';

export const swrGlobalConfiguration: SWRConfiguration = {
  revalidateOnFocus: false,
  errorRetryCount: 1,
};
