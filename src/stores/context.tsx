import { SWRResponse } from 'swr';
import { User } from '~/interfaces/user';

import { useStaticSWR } from './use-static-swr';

export const useCsrfToken = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('csrfToken', initialData);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCurrentUser = (initialData?: any): SWRResponse<User, any> => {
  return useStaticSWR('currentUser', initialData);
};

export const useCurrentPagePath = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('currentPagePath', initialData);
};

export const useOwnerOfCurrentPage = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('ownerOfCurrentPage', initialData);
};

export const useForbidden = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isForbidden', initialData);
};

export const useNotFound = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isNotFound', initialData);
};

export const useTrash = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isTrash', initialData);
};

export const useShared = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isShared', initialData);
};

export const useShareLinkId = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('shareLinkId', initialData);
};

export const useIsSharedUser = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isSharedUser', initialData);
};

export const useIsAbleToDeleteCompletely = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isAbleToDeleteCompletely', initialData);
};

export const useAppTitle = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('appTitle', initialData);
};

export const useSiteUrl = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('siteUrl', initialData);
};

export const useConfidential = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('confidential', initialData);
};

export const useSearchServiceConfigured = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('searchServiceConfigured', initialData);
};

export const useSearchServiceReachable = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('searchServiceReachable', initialData);
};

export const useIsMailerSetup = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isMailerSetup', initialData);
};

export const useAclEnabled = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isAclEnabled', initialData);
};

export const useHasSlackConfig = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('hasSlackConfig', initialData);
};

export const useDrawioUri = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('drawioUri', initialData);
};

export const useHackmdUri = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('hackmdUri', initialData);
};

export const useMathJax = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('mathJax', initialData);
};

export const useNoCdn = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('noCdn', initialData);
};

export const useEditorConfig = (initialData?: any): SWRResponse<any, any> => {
  return useStaticSWR('editorConfig', initialData);
};

export const useIsAllReplyShown = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isAllReplyShown', initialData, false);
};

export const useIsEnabledStaleNotification = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isEnabledStaleNotification', initialData, false);
};

export const useGrowiVersion = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('growiVersion', initialData);
};
