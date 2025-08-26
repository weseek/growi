import { atom, useAtom } from 'jotai';

import type { RendererConfig } from '~/interfaces/services/renderer';

import type { UseAtom } from '../helper';

/**
 * Atom for AI feature enabled status
 */
export const aiEnabledAtom = atom<boolean>(false);

export const useIsAiEnabled = (): UseAtom<typeof aiEnabledAtom> => {
  return useAtom(aiEnabledAtom);
};

/**
 * Atom for limit learnable page count per assistant
 */
export const limitLearnablePageCountPerAssistantAtom = atom<number>(0);

export const useLimitLearnablePageCountPerAssistant = (): UseAtom<typeof limitLearnablePageCountPerAssistantAtom> => {
  return useAtom(limitLearnablePageCountPerAssistantAtom);
};

/**
 * Atom for users homepage deletion enabled status
 */
export const isUsersHomepageDeletionEnabledAtom = atom<boolean>(false);

export const useIsUsersHomepageDeletionEnabled = (): UseAtom<typeof isUsersHomepageDeletionEnabledAtom> => {
  return useAtom(isUsersHomepageDeletionEnabledAtom);
};

/**
 * Atom for default indent size (default indent size)
 */
export const defaultIndentSizeAtom = atom<number>(4);

export const useDefaultIndentSize = (): UseAtom<typeof defaultIndentSizeAtom> => {
  return useAtom(defaultIndentSizeAtom);
};

/**
 * Atom for search scope children as default
 */
export const isSearchScopeChildrenAsDefaultAtom = atom<boolean>(false);

export const useIsSearchScopeChildrenAsDefault = (): UseAtom<typeof isSearchScopeChildrenAsDefaultAtom> => {
  return useAtom(isSearchScopeChildrenAsDefaultAtom);
};

/**
 * Atom for elasticsearch max body length to index
 */
export const elasticsearchMaxBodyLengthToIndexAtom = atom<number>(0);

export const useElasticsearchMaxBodyLengthToIndex = (): UseAtom<typeof elasticsearchMaxBodyLengthToIndexAtom> => {
  return useAtom(elasticsearchMaxBodyLengthToIndexAtom);
};

/**
 * Atom for ROM user allowed to comment
 */
export const isRomUserAllowedToCommentAtom = atom<boolean>(false);

export const useIsRomUserAllowedToComment = (): UseAtom<typeof isRomUserAllowedToCommentAtom> => {
  return useAtom(isRomUserAllowedToCommentAtom);
};

/**
 * Atom for drawio URI
 */
export const drawioUriAtom = atom<string | null>(null);

export const useDrawioUri = (): UseAtom<typeof drawioUriAtom> => {
  return useAtom(drawioUriAtom);
};

/**
 * Atom for all reply shown
 */
export const isAllReplyShownAtom = atom<boolean>(false);

export const useIsAllReplyShown = (): UseAtom<typeof isAllReplyShownAtom> => {
  return useAtom(isAllReplyShownAtom);
};

/**
 * Atom for show page side authors
 */
export const showPageSideAuthorsAtom = atom<boolean>(false);

export const useShowPageSideAuthors = (): UseAtom<typeof showPageSideAuthorsAtom> => {
  return useAtom(showPageSideAuthorsAtom);
};

/**
 * Atom for container fluid
 */
export const isContainerFluidAtom = atom<boolean>(false);

export const useIsContainerFluid = (): UseAtom<typeof isContainerFluidAtom> => {
  return useAtom(isContainerFluidAtom);
};

/**
 * Atom for stale notification enabled
 */
export const isEnabledStaleNotificationAtom = atom<boolean>(false);

export const useIsEnabledStaleNotification = (): UseAtom<typeof isEnabledStaleNotificationAtom> => {
  return useAtom(isEnabledStaleNotificationAtom);
};

/**
 * Atom for disable link sharing
 */
export const disableLinkSharingAtom = atom<boolean>(false);

export const useDisableLinkSharing = (): UseAtom<typeof disableLinkSharingAtom> => {
  return useAtom(disableLinkSharingAtom);
};

/**
 * Atom for indent size forced
 */
export const isIndentSizeForcedAtom = atom<boolean>(false);

export const useIsIndentSizeForced = (): UseAtom<typeof isIndentSizeForcedAtom> => {
  return useAtom(isIndentSizeForcedAtom);
};

/**
 * Atom for attach title header enabled
 */
export const isEnabledAttachTitleHeaderAtom = atom<boolean>(false);

export const useIsEnabledAttachTitleHeader = (): UseAtom<typeof isEnabledAttachTitleHeaderAtom> => {
  return useAtom(isEnabledAttachTitleHeaderAtom);
};

/**
 * Atom for search service configured
 */
export const isSearchServiceConfiguredAtom = atom<boolean>(false);

export const useIsSearchServiceConfigured = (): UseAtom<typeof isSearchServiceConfiguredAtom> => {
  return useAtom(isSearchServiceConfiguredAtom);
};

/**
 * Atom for search service reachable
 */
export const isSearchServiceReachableAtom = atom<boolean>(false);

export const useIsSearchServiceReachable = (): UseAtom<typeof isSearchServiceReachableAtom> => {
  return useAtom(isSearchServiceReachableAtom);
};

/**
 * Atom for Slack configured
 */
export const isSlackConfiguredAtom = atom<boolean>(false);

export const useIsSlackConfigured = (): UseAtom<typeof isSlackConfiguredAtom> => {
  return useAtom(isSlackConfiguredAtom);
};

/**
 * Atom for ACL enabled
 */
export const isAclEnabledAtom = atom<boolean>(false);

export const useIsAclEnabled = (): UseAtom<typeof isAclEnabledAtom> => {
  return useAtom(isAclEnabledAtom);
};

/**
 * Atom for upload all file allowed
 */
export const isUploadAllFileAllowedAtom = atom<boolean>(false);

export const useIsUploadAllFileAllowed = (): UseAtom<typeof isUploadAllFileAllowedAtom> => {
  return useAtom(isUploadAllFileAllowedAtom);
};

/**
 * Atom for upload enabled
 */
export const isUploadEnabledAtom = atom<boolean>(false);

export const useIsUploadEnabled = (): UseAtom<typeof isUploadEnabledAtom> => {
  return useAtom(isUploadEnabledAtom);
};

/**
 * Atom for bulk export pages enabled
 */
export const isBulkExportPagesEnabledAtom = atom<boolean>(false);

export const useIsBulkExportPagesEnabled = (): UseAtom<typeof isBulkExportPagesEnabledAtom> => {
  return useAtom(isBulkExportPagesEnabledAtom);
};

/**
 * Atom for PDF bulk export enabled
 */
export const isPdfBulkExportEnabledAtom = atom<boolean>(false);

export const useIsPdfBulkExportEnabled = (): UseAtom<typeof isPdfBulkExportEnabledAtom> => {
  return useAtom(isPdfBulkExportEnabledAtom);
};

/**
 * Atom for local account registration enabled
 */
export const isLocalAccountRegistrationEnabledAtom = atom<boolean>(false);

export const useIsLocalAccountRegistrationEnabled = (): UseAtom<typeof isLocalAccountRegistrationEnabledAtom> => {
  return useAtom(isLocalAccountRegistrationEnabledAtom);
};

/**
 * Atom for renderer config
 */
export const rendererConfigAtom = atom<RendererConfig>({
  isEnabledLinebreaks: false,
  isEnabledLinebreaksInComments: false,
  isEnabledMarp: false,
  adminPreferredIndentSize: 4,
  isIndentSizeForced: false,
  drawioUri: '',
  plantumlUri: '',
  highlightJsStyleBorder: false,
  isEnabledXssPrevention: true,
  sanitizeType: 'Recommended',
  customTagWhitelist: [],
  customAttrWhitelist: {},
});

export const useRendererConfig = (): UseAtom<typeof rendererConfigAtom> => {
  return useAtom(rendererConfigAtom);
};
