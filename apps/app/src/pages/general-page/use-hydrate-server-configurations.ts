import { useHydrateAtoms } from 'jotai/utils';

import type { RendererConfig } from '~/interfaces/services/renderer';
import {
  aiEnabledAtom,
  limitLearnablePageCountPerAssistantAtom,
  isUsersHomepageDeletionEnabledAtom,
  defaultIndentSizeAtom,
  isSearchScopeChildrenAsDefaultAtom,
  elasticsearchMaxBodyLengthToIndexAtom,
  isRomUserAllowedToCommentAtom,
  drawioUriAtom,
  isAllReplyShownAtom,
  showPageSideAuthorsAtom,
  isContainerFluidAtom,
  isEnabledStaleNotificationAtom,
  disableLinkSharingAtom,
  isIndentSizeForcedAtom,
  isEnabledAttachTitleHeaderAtom,
  isSearchServiceConfiguredAtom,
  isSearchServiceReachableAtom,
  isSlackConfiguredAtom,
  isAclEnabledAtom,
  isUploadAllFileAllowedAtom,
  isUploadEnabledAtom,
  isBulkExportPagesEnabledAtom,
  isPdfBulkExportEnabledAtom,
  isLocalAccountRegistrationEnabledAtom,
  rendererConfigAtom,
} from '~/states/server-configurations/server-configurations';

import type { ServerConfigurationProps } from './types';

/**
 * Hook for hydrating server configuration atoms with server-side data
 * This should be called early in the app component to ensure atoms are properly initialized before rendering
 */
export const useHydrateServerConfigurationAtoms = (
    serverConfig: ServerConfigurationProps['serverConfig'] | undefined,
    rendererConfigs: RendererConfig | undefined,
): void => {
  // Hydrate server configuration atoms with server-side data
  useHydrateAtoms(serverConfig == null || rendererConfigs == null ? [] : [
    [aiEnabledAtom, serverConfig.aiEnabled],
    [limitLearnablePageCountPerAssistantAtom, serverConfig.limitLearnablePageCountPerAssistant],
    [isUsersHomepageDeletionEnabledAtom, serverConfig.isUsersHomepageDeletionEnabled],
    [defaultIndentSizeAtom, serverConfig.adminPreferredIndentSize],
    [isSearchScopeChildrenAsDefaultAtom, serverConfig.isSearchScopeChildrenAsDefault],
    [elasticsearchMaxBodyLengthToIndexAtom, serverConfig.elasticsearchMaxBodyLengthToIndex],
    [isRomUserAllowedToCommentAtom, serverConfig.isRomUserAllowedToComment],
    [drawioUriAtom, serverConfig.drawioUri],
    [isAllReplyShownAtom, serverConfig.isAllReplyShown],
    [showPageSideAuthorsAtom, serverConfig.showPageSideAuthors],
    [isContainerFluidAtom, serverConfig.isContainerFluid],
    [isEnabledStaleNotificationAtom, serverConfig.isEnabledStaleNotification],
    [disableLinkSharingAtom, serverConfig.disableLinkSharing],
    [isIndentSizeForcedAtom, serverConfig.isIndentSizeForced],
    [isEnabledAttachTitleHeaderAtom, serverConfig.isEnabledAttachTitleHeader],
    [isSearchServiceConfiguredAtom, serverConfig.isSearchServiceConfigured],
    [isSearchServiceReachableAtom, serverConfig.isSearchServiceReachable],
    [isSlackConfiguredAtom, serverConfig.isSlackConfigured],
    [isAclEnabledAtom, serverConfig.isAclEnabled],
    [isUploadAllFileAllowedAtom, serverConfig.isUploadAllFileAllowed],
    [isUploadEnabledAtom, serverConfig.isUploadEnabled],
    [isBulkExportPagesEnabledAtom, serverConfig.isBulkExportPagesEnabled],
    [isPdfBulkExportEnabledAtom, serverConfig.isPdfBulkExportEnabled],
    [isLocalAccountRegistrationEnabledAtom, serverConfig.isLocalAccountRegistrationEnabled],
    [rendererConfigAtom, rendererConfigs],
  ]);
};
