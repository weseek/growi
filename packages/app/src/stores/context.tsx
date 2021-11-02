import { SWRResponse } from 'swr';
import { pagePathUtils } from '@growi/core';

import { IUser } from '../interfaces/user';

import { useStaticSWR } from './use-static-swr';

export const useCurrentUser = (currentUser?: IUser): SWRResponse<IUser, Error> => {
  return useStaticSWR('currentUser', currentUser || null);
};

export const useCurrentPagePath = (currentPagePath?: string): SWRResponse<string, Error> => {
  return useStaticSWR('currentPagePath', currentPagePath || null);
};

export const useIsSharedUser = (): SWRResponse<boolean, Error> => {
  const { data: currentUser } = useCurrentUser();
  const { data: currentPagePath } = useCurrentPagePath();

  const isLoading = currentUser === undefined || currentPagePath === undefined;

  const key = isLoading ? null : 'isSharedUser';
  const value = !isLoading && currentUser == null && pagePathUtils.isSharedPage(currentPagePath);

  return useStaticSWR(key, value);
};
