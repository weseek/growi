import { IUser } from '@growi/core';
import { HtmlElementNode } from 'rehype-toc';
import { Key, SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';


import { SupportedActionType } from '~/interfaces/activity';
import { IResLayoutSetting } from '~/interfaces/customize';
import { EditorConfig } from '~/interfaces/editor-settings';
// import { CustomWindow } from '~/interfaces/global';
import { RendererConfig } from '~/interfaces/services/renderer';
import { GrowiThemes } from '~/interfaces/theme';
import InterceptorManager from '~/services/interceptor-manager';

import { TargetAndAncestors } from '../interfaces/page-listing-results';

import { useStaticSWR } from './use-static-swr';


type Nullable<T> = T | null;


export const useInterceptorManager = (): SWRResponse<InterceptorManager, Error> => {
  return useStaticSWR<InterceptorManager, Error>('interceptorManager', undefined, { fallbackData: new InterceptorManager() });
};

export const useCsrfToken = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR<string, Error>('csrfToken', initialData);
};

export const useAppTitle = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR('appTitle', initialData);
};

export const useSiteUrl = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR<string, Error>('siteUrl', initialData);
};

export const useConfidential = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR('confidential', initialData);
};

export const useGrowiTheme = (initialData?: GrowiThemes): SWRResponse<GrowiThemes, Error> => {
  return useStaticSWR('theme', initialData);
};

export const useCurrentUser = (initialData?: Nullable<IUser>): SWRResponse<Nullable<IUser>, Error> => {
  return useStaticSWR<Nullable<IUser>, Error>('currentUser', initialData);
};

export const useRevisionId = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('revisionId', initialData);
};

export const useCurrentPagePath = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('currentPagePath', initialData);
};

export const useCurrentPathname = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR('currentPathname', initialData);
};

export const useCurrentPageId = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('currentPageId', initialData);
};

export const useRevisionCreatedAt = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('revisionCreatedAt', initialData);
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

// export const useIsNotCreatable = (initialData?: boolean): SWRResponse<boolean, Error> => {
//   return useStaticSWR<boolean, Error>('isNotCreatable', initialData, { fallbackData: false });
// };
export const useIsForbidden = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isForbidden', initialData, { fallbackData: false });
};

export const useIsNotFound = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isNotFound', initialData, { fallbackData: false });
};

export const useHasChildren = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('hasChildren', initialData);
};

export const useTemplateTagData = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('templateTagData', initialData);
};

export const useIsSharedUser = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isSharedUser', initialData);
};

export const useShareLinksNumber = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('shareLinksNumber', initialData);
};

export const useShareLinkId = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('shareLinkId', initialData);
};

export const useDisableLinkSharing = (initialData?: Nullable<boolean>): SWRResponse<Nullable<boolean>, Error> => {
  return useStaticSWR<Nullable<boolean>, Error>('disableLinkSharing', initialData);
};

export const useRegistrationWhiteList = (initialData?: Nullable<string[]>): SWRResponse<Nullable<string[]>, Error> => {
  return useStaticSWR<Nullable<string[]>, Error>('registrationWhiteList', initialData);
};

export const useRevisionIdHackmdSynced = (initialData?: Nullable<any>): SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('revisionIdHackmdSynced', initialData);
};

export const useDrawioUri = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR('drawioUri', initialData, { fallbackData: 'https://embed.diagrams.net/' });
};

export const useHackmdUri = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('hackmdUri', initialData);
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

export const useIsSearchPage = (initialData?: Nullable<any>) : SWRResponse<Nullable<any>, Error> => {
  return useStaticSWR<Nullable<any>, Error>('isSearchPage', initialData);
};

export const useTargetAndAncestors = (initialData?: TargetAndAncestors): SWRResponse<TargetAndAncestors, Error> => {
  return useStaticSWR<TargetAndAncestors, Error>('targetAndAncestors', initialData);
};

export const useIsAclEnabled = (initialData?: boolean) : SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isAclEnabled', initialData);
};

export const useIsSearchServiceConfigured = (initialData?: boolean) : SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isSearchServiceConfigured', initialData);
};

export const useIsSearchServiceReachable = (initialData?: boolean) : SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isSearchServiceReachable', initialData);
};

export const useIsMailerSetup = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isMailerSetup', initialData);
};

export const useIsSearchScopeChildrenAsDefault = (initialData?: boolean) : SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isSearchScopeChildrenAsDefault', initialData);
};

export const useIsSlackConfigured = (initialData?: boolean) : SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isSlackConfigured', initialData);
};

export const useIsEnabledAttachTitleHeader = (initialData?: boolean) : SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isEnabledAttachTitleHeader', initialData);
};

export const useHasParent = (initialData?: boolean) : SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('hasParent', initialData);
};

export const useIsIndentSizeForced = (initialData?: boolean) : SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isIndentSizeForced', initialData, { fallbackData: false });
};

export const useDefaultIndentSize = (initialData?: number) : SWRResponse<number, Error> => {
  return useStaticSWR<number, Error>('defaultIndentSize', initialData, { fallbackData: 4 });
};

export const useAuditLogEnabled = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('auditLogEnabled', initialData, { fallbackData: false });
};

export const useActivityExpirationSeconds = (initialData?: number) : SWRResponse<number, Error> => {
  return useStaticSWR<number, Error>('activityExpirationSeconds', initialData);
};

export const useAuditLogAvailableActions = (initialData?: Array<SupportedActionType>) : SWRResponse<Array<SupportedActionType>, Error> => {
  return useStaticSWR<Array<SupportedActionType>, Error>('auditLogAvailableActions', initialData);
};

export const useGrowiVersion = (initialData?: string): SWRResponse<string, any> => {
  return useStaticSWR('growiVersion', initialData);
};

export const useIsEnabledStaleNotification = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isEnabledStaleNotification', initialData);
};

export const useIsLatestRevision = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isLatestRevision', initialData);
};

export const useEditorConfig = (initialData?: EditorConfig): SWRResponse<EditorConfig, Error> => {
  return useStaticSWR<EditorConfig, Error>('editorConfig', initialData);
};

export const useRendererConfig = (initialData?: RendererConfig): SWRResponse<RendererConfig, any> => {
  return useStaticSWR('growiRendererConfig', initialData);
};

export const useIsAllReplyShown = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isAllReplyShown', initialData);
};

export const useIsBlinkedHeaderAtBoot = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isBlinkedAtBoot', initialData, { fallbackData: false });
};

export const useEditingMarkdown = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR('currentMarkdown', initialData);
};

export const useIsUploadableImage = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isUploadableImage', initialData);
};

export const useIsUploadableFile = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isUploadableFile', initialData);
};

export const useShowPageLimitationL = (initialData?: number): SWRResponse<number, Error> => {
  return useStaticSWR('showPageLimitationL', initialData);
};

export const useShowPageLimitationXL = (initialData?: number): SWRResponse<number, Error> => {
  return useStaticSWR('showPageLimitationXL', initialData);
};

export const useLayoutSetting = (initialData?: IResLayoutSetting): SWRResponse<IResLayoutSetting, Error> => {
  return useStaticSWR('layoutSetting', initialData);
};

export const useCustomizeTitle = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR('CustomizeTitle', initialData);
};

/** **********************************************************
 *                     Computed contexts
 *********************************************************** */

export const useIsGuestUser = (): SWRResponse<boolean, Error> => {
  const { data: currentUser } = useCurrentUser();

  return useSWRImmutable(
    ['isGuestUser', currentUser],
    (key: Key, currentUser: IUser) => currentUser == null,
    { fallbackData: currentUser == null },
  );
};

export const useIsEditable = (): SWRResponse<boolean, Error> => {
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isForbidden } = useIsForbidden();
  const { data: isIdenticalPath } = useIsIdenticalPath();
  const { data: isTrashPage } = useIsTrashPage();

  return useSWRImmutable(
    ['isEditable', isGuestUser, isForbidden, isIdenticalPath, isTrashPage],
    (key: Key, isGuestUser: boolean, isForbidden: boolean, isIdenticalPath: boolean, isTrashPage: boolean) => {
      return (!isTrashPage && !isForbidden && !isIdenticalPath && !isGuestUser);
    },
  );
};

export const useCurrentPageTocNode = (): SWRResponse<HtmlElementNode, any> => {
  const { data: currentPagePath } = useCurrentPagePath();

  return useStaticSWR(['currentPageTocNode', currentPagePath]);
};
