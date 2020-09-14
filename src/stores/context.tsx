import useSWR, { responseInterface } from 'swr';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCurrentUser = (initialData?: any): responseInterface<any, any> => {
  return useSWR('currentUser', { initialData });
};

export const useAppTitle = (initialData?: string): responseInterface<string, any> => {
  return useSWR('appTitle', { initialData });
};

export const useSiteUrl = (initialData?: string): responseInterface<string, any> => {
  return useSWR('siteUrl', { initialData });
};

export const useConfidential = (initialData?: string): responseInterface<string, any> => {
  return useSWR('confidential', { initialData });
};
