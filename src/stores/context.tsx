import useSWR, { mutate, responseInterface } from 'swr';

const useStaticSWR = <Data, Error>(key: string, initialData?: Data): responseInterface<Data, Error> => {
  if (initialData != null) {
    mutate(key, initialData);
  }
  return useSWR(key);
};

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
