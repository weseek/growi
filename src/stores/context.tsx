import useSWR, { responseInterface } from 'swr';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCurrentUser = (initialData?: any): responseInterface<any, any> => {
  return useSWR('static/app/currentUser', { initialData });
};

export const useAppTitle = (initialData?: string): responseInterface<string, any> => {
  return useSWR('static/app/appTitle', { initialData });
};

export const useSiteUrl = (initialData?: string): responseInterface<string, any> => {
  return useSWR('static/app/siteUrl', { initialData });
};

export const useConfidential = (initialData?: string): responseInterface<string, any> => {
  return useSWR('static/app/confidential', { initialData });
};
