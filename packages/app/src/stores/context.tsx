import { IUser, pagePathUtils } from '@growi/core';
import { HtmlElementNode } from 'rehype-toc';
import { Key, SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';


import { SupportedActionType } from '~/interfaces/activity';
import { EditorConfig } from '~/interfaces/editor-settings';
// import { CustomWindow } from '~/interfaces/global';
import { RendererConfig } from '~/interfaces/services/renderer';
import { GrowiThemes } from '~/interfaces/theme';
import InterceptorManager from '~/services/interceptor-manager';

import { TargetAndAncestors } from '../interfaces/page-listing-results';

import { useContextSWR, ContextSWRResponse } from './use-context-swr';
import { useStaticSWR } from './use-static-swr';


type Nullable<T> = T | null;


export const useInterceptorManager = (): ContextSWRResponse<InterceptorManager, Error> => {
  return useContextSWR<InterceptorManager, Error>('interceptorManager', undefined, { fallbackData: new InterceptorManager() });
};

export const useCsrfToken = (initialData?: string): ContextSWRResponse<string, Error> => {
  return useContextSWR<string, Error>('csrfToken', initialData);
};

export const useAppTitle = (initialData?: string): ContextSWRResponse<string, Error> => {
  return useContextSWR('appTitle', initialData);
};

export const useSiteUrl = (initialData?: string): ContextSWRResponse<string, Error> => {
  return useContextSWR<string, Error>('siteUrl', initialData);
};

export const useConfidential = (initialData?: string): ContextSWRResponse<string, Error> => {
  return useContextSWR('confidential', initialData);
};

export const useGrowiTheme = (initialData?: GrowiThemes): ContextSWRResponse<GrowiThemes, Error> => {
  return useContextSWR('theme', initialData);
};

export const useCurrentUser = (initialData?: Nullable<IUser>): ContextSWRResponse<Nullable<IUser>, Error> => {
  return useContextSWR<Nullable<IUser>, Error>('currentUser', initialData);
};

export const useRevisionId = (initialData?: Nullable<any>): ContextSWRResponse<Nullable<any>, Error> => {
  return useContextSWR<Nullable<any>, Error>('revisionId', initialData);
};

export const useCurrentPagePath = (initialData?: Nullable<string>): ContextSWRResponse<Nullable<string>, Error> => {
  return useContextSWR<Nullable<string>, Error>('currentPagePath', initialData);
};

export const useCurrentPathname = (initialData?: string): ContextSWRResponse<string, Error> => {
  return useContextSWR('currentPathname', initialData);
};

export const useCurrentPageId = (initialData?: Nullable<string>): ContextSWRResponse<Nullable<string>, Error> => {
  return useContextSWR<Nullable<string>, Error>('currentPageId', initialData);
};

export const useIsIdenticalPath = (initialData?: boolean): ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('isIdenticalPath', initialData, { fallbackData: false });
};

export const useIsForbidden = (initialData?: boolean): ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('isForbidden', initialData, { fallbackData: false });
};

export const useIsNotFound = (initialData?: boolean): ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('isNotFound', initialData, { fallbackData: false });
};

export const useTemplateTagData = (initialData?: Nullable<string>): ContextSWRResponse<Nullable<string>, Error> => {
  return useContextSWR<Nullable<string>, Error>('templateTagData', initialData);
};

export const useIsSharedUser = (initialData?: boolean): ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('isSharedUser', initialData);
};

export const useShareLinkId = (initialData?: Nullable<string>): ContextSWRResponse<Nullable<string>, Error> => {
  return useContextSWR<Nullable<string>, Error>('shareLinkId', initialData);
};

export const useDisableLinkSharing = (initialData?: Nullable<boolean>): ContextSWRResponse<Nullable<boolean>, Error> => {
  return useContextSWR<Nullable<boolean>, Error>('disableLinkSharing', initialData);
};

export const useRegistrationWhiteList = (initialData?: Nullable<string[]>): ContextSWRResponse<Nullable<string[]>, Error> => {
  return useContextSWR<Nullable<string[]>, Error>('registrationWhiteList', initialData);
};

export const useDrawioUri = (initialData?: string): ContextSWRResponse<string, Error> => {
  return useContextSWR('drawioUri', initialData, { fallbackData: 'https://embed.diagrams.net/' });
};

export const useHackmdUri = (initialData?: Nullable<string>): ContextSWRResponse<Nullable<string>, Error> => {
  return useContextSWR<Nullable<string>, Error>('hackmdUri', initialData);
};

export const useIsSearchPage = (initialData?: Nullable<any>) : ContextSWRResponse<Nullable<any>, Error> => {
  return useContextSWR<Nullable<any>, Error>('isSearchPage', initialData);
};

export const useTargetAndAncestors = (initialData?: TargetAndAncestors): ContextSWRResponse<TargetAndAncestors, Error> => {
  return useContextSWR<TargetAndAncestors, Error>('targetAndAncestors', initialData);
};

export const useIsAclEnabled = (initialData?: boolean) : ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('isAclEnabled', initialData);
};

export const useIsSearchServiceConfigured = (initialData?: boolean) : ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('isSearchServiceConfigured', initialData);
};

export const useIsSearchServiceReachable = (initialData?: boolean) : ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('isSearchServiceReachable', initialData);
};

export const useIsMailerSetup = (initialData?: boolean): ContextSWRResponse<boolean, any> => {
  return useContextSWR('isMailerSetup', initialData);
};

export const useIsSearchScopeChildrenAsDefault = (initialData?: boolean) : ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('isSearchScopeChildrenAsDefault', initialData);
};

export const useIsSlackConfigured = (initialData?: boolean) : ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('isSlackConfigured', initialData);
};

export const useIsEnabledAttachTitleHeader = (initialData?: boolean) : ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('isEnabledAttachTitleHeader', initialData);
};

export const useIsIndentSizeForced = (initialData?: boolean) : ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('isIndentSizeForced', initialData, { fallbackData: false });
};

export const useDefaultIndentSize = (initialData?: number) : ContextSWRResponse<number, Error> => {
  return useContextSWR<number, Error>('defaultIndentSize', initialData, { fallbackData: 4 });
};

export const useAuditLogEnabled = (initialData?: boolean): ContextSWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('auditLogEnabled', initialData, { fallbackData: false });
};

// TODO: initialize in [[..path]].page.tsx?
export const useActivityExpirationSeconds = (initialData?: number) : ContextSWRResponse<number, Error> => {
  return useContextSWR<number, Error>('activityExpirationSeconds', initialData);
};

export const useAuditLogAvailableActions = (initialData?: Array<SupportedActionType>) : ContextSWRResponse<Array<SupportedActionType>, Error> => {
  return useContextSWR<Array<SupportedActionType>, Error>('auditLogAvailableActions', initialData);
};

export const useGrowiVersion = (initialData?: string): ContextSWRResponse<string, any> => {
  return useContextSWR('growiVersion', initialData);
};

export const useIsEnabledStaleNotification = (initialData?: boolean): ContextSWRResponse<boolean, any> => {
  return useContextSWR('isEnabledStaleNotification', initialData);
};

export const useIsLatestRevision = (initialData?: boolean): ContextSWRResponse<boolean, any> => {
  return useContextSWR('isLatestRevision', initialData);
};

export const useEditorConfig = (initialData?: EditorConfig): ContextSWRResponse<EditorConfig, Error> => {
  return useContextSWR<EditorConfig, Error>('editorConfig', initialData);
};

export const useRendererConfig = (initialData?: RendererConfig): ContextSWRResponse<RendererConfig, any> => {
  return useContextSWR('growiRendererConfig', initialData);
};

export const useIsAllReplyShown = (initialData?: boolean): ContextSWRResponse<boolean, Error> => {
  return useContextSWR('isAllReplyShown', initialData);
};

export const useIsBlinkedHeaderAtBoot = (initialData?: boolean): ContextSWRResponse<boolean, Error> => {
  return useContextSWR('isBlinkedAtBoot', initialData, { fallbackData: false });
};

export const useEditingMarkdown = (initialData?: string): ContextSWRResponse<string, Error> => {
  return useContextSWR('currentMarkdown', initialData);
};

export const useIsUploadableImage = (initialData?: boolean): ContextSWRResponse<boolean, Error> => {
  return useContextSWR('isUploadableImage', initialData);
};

export const useIsUploadableFile = (initialData?: boolean): ContextSWRResponse<boolean, Error> => {
  return useContextSWR('isUploadableFile', initialData);
};

export const useShowPageLimitationL = (initialData?: number): ContextSWRResponse<number, Error> => {
  return useContextSWR('showPageLimitationL', initialData);
};

export const useShowPageLimitationXL = (initialData?: number): ContextSWRResponse<number, Error> => {
  return useContextSWR('showPageLimitationXL', initialData);
};

export const useCustomizeTitle = (initialData?: string): ContextSWRResponse<string, Error> => {
  return useContextSWR('CustomizeTitle', initialData);
};

export const useCustomizedLogoSrc = (initialData?: string): ContextSWRResponse<string, Error> => {
  return useContextSWR('customizedLogoSrc', initialData);
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

  return useSWRImmutable(
    ['isEditable', isGuestUser, isForbidden, isIdenticalPath],
    (key: Key, isGuestUser: boolean, isForbidden: boolean, isIdenticalPath: boolean) => {
      return (!isForbidden && !isIdenticalPath && !isGuestUser);
    },
  );
};

export const useCurrentPageTocNode = (): SWRResponse<HtmlElementNode, any> => {
  const { data: currentPagePath } = useCurrentPagePath();

  return useStaticSWR(['currentPageTocNode', currentPagePath]);
};

export const useIsTrashPage = (): SWRResponse<boolean, Error> => {
  const { data: pagePath } = useCurrentPagePath();

  return useSWRImmutable(
    pagePath == null ? null : ['isTrashPage', pagePath],
    (key: Key, pagePath: string) => pagePathUtils.isTrashPage(pagePath),
  );
};
