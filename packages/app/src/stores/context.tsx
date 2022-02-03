import { Key, SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { pagePathUtils } from '@growi/core';

import { IUser } from '../interfaces/user';

import { useStaticSWR } from './use-static-swr';

import { TargetAndAncestors, NotFoundTargetPathOrId } from '../interfaces/page-listing-results';

type Nullable<T> = T | null;

export const useCurrentUser = (initialData?: Nullable<IUser>): SWRResponse<Nullable<IUser>, Error> => {
  return useStaticSWR<Nullable<IUser>, Error>('currentUser', initialData);
};

export const useRevisionId = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('revisionId', initialData);
};

export const useCurrentPagePath = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('currentPagePath', initialData);
};

export const useCurrentPageId = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('currentPageId', initialData);
};

export const useRevisionCreatedAt = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('revisionCreatedAt', initialData);
};

export const useCurrentCreatedAt = (initialData?: Nullable<Date>): SWRResponse<Nullable<Date>, Error> => {
  return useStaticSWR<Nullable<Date>, Error>('createdAt', initialData);
};

export const useCurrentUpdatedAt = (initialData?: Nullable<Date>): SWRResponse<Nullable<Date>, Error> => {
  return useStaticSWR<Nullable<Date>, Error>('updatedAt', initialData);
};

export const useDeletedAt = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('deletedAt', initialData);
};

export const useIsIdenticalPath = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isIdenticalPath', initialData, { fallbackData: false });
};

export const useIsUserPage = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isUserPage', initialData, { fallbackData: false });
};

export const useIsTrashPage = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isTrashPage', initialData, { fallbackData: false });
};

export const useIsDeleted = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isDeleted', initialData, { fallbackData: false });
};

export const useIsDeletable = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isDeletable', initialData, { fallbackData: false });
};

export const useIsNotCreatable = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isNotCreatable', initialData, { fallbackData: false });
};

export const useIsAbleToDeleteCompletely = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isAbleToDeleteCompletely', initialData, { fallbackData: false });
};

export const useIsForbidden = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isForbidden', initialData, { fallbackData: false });
};

export const usePageUser = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('pageUser', initialData);
};

export const useHasChildren = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('hasChildren', initialData);
};

export const useTemplateTagData = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('templateTagData', initialData);
};

export const useShareLinksNumber = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('shareLinksNumber', initialData);
};

export const useShareLinkId = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('shareLinkId', initialData);
};

export const useRevisionIdHackmdSynced = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('revisionIdHackmdSynced', initialData);
};

export const useLastUpdateUsername = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('lastUpdateUsername', initialData);
};

export const useDeleteUsername = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('deleteUsername', initialData);
};

export const usePageIdOnHackmd = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('pageIdOnHackmd', initialData);
};

export const useHasDraftOnHackmd = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('hasDraftOnHackmd', initialData);
};

export const useCreator = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('creator', initialData);
};

export const useRevisionAuthor = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('revisionAuthor', initialData);
};

export const useSlackChannels = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('slackChannels', initialData);
};

export const useIsSearchPage = (initialData?: Nullable<any>) : SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('isSearchPage', initialData);
};

export const useTargetAndAncestors = (initialData?: TargetAndAncestors): SWRResponse<TargetAndAncestors, Error> => {
  return useStaticSWR<TargetAndAncestors, Error>('targetAndAncestors', initialData);
};

export const useNotFoundTargetPathOrId = (initialData?: Nullable<NotFoundTargetPathOrId>): SWRResponse<Nullable<NotFoundTargetPathOrId>, Error> => {
  return useStaticSWR<Nullable<NotFoundTargetPathOrId>, Error>('notFoundTargetPathOrId', initialData);
};


/** **********************************************************
 *                     Computed contexts
 *********************************************************** */

export const useIsGuestUser = (): SWRResponse<boolean, Error> => {
  const { data: currentUser } = useCurrentUser();

  return useSWRImmutable(
    ['isGuestUser', currentUser],
    (key: Key, currentUser: IUser) => currentUser == null,
  );
};

export const useIsEditable = (): SWRResponse<boolean, Error> => {
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isNotCreatable } = useIsNotCreatable();
  const { data: isTrashPage } = useIsTrashPage();

  return useSWRImmutable(
    ['isEditable', isGuestUser, isTrashPage, isNotCreatable],
    (key: Key, isGuestUser: boolean, isTrashPage: boolean, isNotCreatable: boolean) => {
      return (!isNotCreatable && !isTrashPage && !isGuestUser);
    },
  );
};

export const useIsSharedUser = (): SWRResponse<boolean, Error> => {
  const { data: isGuestUser } = useIsGuestUser();
  const { data: currentPagePath } = useCurrentPagePath();

  return useSWRImmutable(
    ['isSharedUser', isGuestUser, currentPagePath],
    (key: Key, isGuestUser: boolean, currentPagePath: string) => {
      return isGuestUser && pagePathUtils.isSharedPage(currentPagePath as string);
    },
  );
};
