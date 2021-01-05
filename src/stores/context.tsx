import { responseInterface } from 'swr';

import { useStaticSWR } from './use-static-swr';

export const useCsrfToken = (initialData?: string): responseInterface<string, any> => {
  return useStaticSWR('csrfToken', initialData);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCurrentUser = (initialData?: any): responseInterface<any, any> => {
  return useStaticSWR('currentUser', initialData);
};

export const useCurrentPagePath = (initialData?: string): responseInterface<string, any> => {
  return useStaticSWR('currentPagePath', initialData);
};

export const useOwnerOfCurrentPage = (initialData?: string): responseInterface<string, any> => {
  return useStaticSWR('ownerOfCurrentPage', initialData);
};

export const useForbidden = (initialData?: boolean): responseInterface<boolean, any> => {
  return useStaticSWR('isForbidden', initialData);
};

export const useNotFound = (initialData?: boolean): responseInterface<boolean, any> => {
  return useStaticSWR('isNotFound', initialData);
};

export const useIsAbleToDeleteCompletely = (initialData?: boolean): responseInterface<boolean, any> => {
  return useStaticSWR('isAbleToDeleteCompletely', initialData);
};

export const useIsAbleToShowTagLabel = (initialData?: boolean): responseInterface<boolean, any> => {
  return useStaticSWR('isAbleToShowTagLabel', initialData);
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
