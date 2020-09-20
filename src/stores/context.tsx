import { responseInterface } from 'swr';

import { useStaticSWR } from './use-static-swr';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCurrentUser = (initialData?: any): responseInterface<any, any> => {
  return useStaticSWR('currentUser', initialData);
};

export const useAppTitle = (initialData?: string): responseInterface<string, any> => {
  return useStaticSWR('appTitle', initialData);
};

export const useSiteUrl = (initialData?: string): responseInterface<string, any> => {
  return useStaticSWR('siteUrl', initialData);
};

export const useConfidential = (initialData?: string): responseInterface<string, any> => {
  return useStaticSWR('confidential', initialData);
};

export const useSearchServiceConfigured = (initialData?: boolean): responseInterface<boolean, any> => {
  return useStaticSWR('searchServiceConfigured', initialData);
};

export const useSearchServiceReachable = (initialData?: boolean): responseInterface<boolean, any> => {
  return useStaticSWR('searchServiceReachable', initialData);
};
