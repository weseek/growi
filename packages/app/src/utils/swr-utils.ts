import { ProviderConfiguration, PublicConfiguration } from 'swr/dist/types';

export type SWRConfigValue = Partial<PublicConfiguration> & Partial<ProviderConfiguration> & {
  provider?: (cache) => any | undefined,
};

export const swrGlobalConfiguration: SWRConfigValue = {
  errorRetryCount: 1,
};
