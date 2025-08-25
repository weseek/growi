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
} from './server-configurations';

/**
 * Type for server configuration initial props
 */
export type ServerConfigurationHyderateArgs = {
  aiEnabled: boolean;
  limitLearnablePageCountPerAssistant: number;
  isUsersHomepageDeletionEnabled: boolean;
  adminPreferredIndentSize: number;
  isSearchServiceConfigured: boolean;
  isSearchServiceReachable: boolean;
  isSearchScopeChildrenAsDefault: boolean;
  elasticsearchMaxBodyLengthToIndex: number;
  isRomUserAllowedToComment: boolean;
  drawioUri: string | null;
  isAllReplyShown: boolean;
  showPageSideAuthors: boolean;
  isContainerFluid: boolean;
  isEnabledStaleNotification: boolean;
  disableLinkSharing: boolean;
  isIndentSizeForced: boolean;
  isEnabledAttachTitleHeader: boolean;
  isSlackConfigured: boolean;
  isAclEnabled: boolean;
  isUploadEnabled: boolean;
  isUploadAllFileAllowed: boolean;
  isBulkExportPagesEnabled: boolean;
  isPdfBulkExportEnabled: boolean;
  isLocalAccountRegistrationEnabled: boolean;
};

/**
 * Hook for hydrating server configuration atoms with server-side data
 * This should be called early in the app component to ensure atoms are properly initialized before rendering
 *
 * @param serverConfigs - Server-side server configuration properties
 */
export const useHydrateServerConfigurationAtoms = (
    serverConfigs: ServerConfigurationHyderateArgs | undefined,
    rendererConfigs: RendererConfig | undefined,
): void => {
  // Hydrate server configuration atoms with server-side data
  useHydrateAtoms(serverConfigs == null || rendererConfigs == null ? [] : [
    [aiEnabledAtom, serverConfigs.aiEnabled],
    [limitLearnablePageCountPerAssistantAtom, serverConfigs.limitLearnablePageCountPerAssistant],
    [isUsersHomepageDeletionEnabledAtom, serverConfigs.isUsersHomepageDeletionEnabled],
    [defaultIndentSizeAtom, serverConfigs.adminPreferredIndentSize],
    [isSearchScopeChildrenAsDefaultAtom, serverConfigs.isSearchScopeChildrenAsDefault],
    [elasticsearchMaxBodyLengthToIndexAtom, serverConfigs.elasticsearchMaxBodyLengthToIndex],
    [isRomUserAllowedToCommentAtom, serverConfigs.isRomUserAllowedToComment],
    [drawioUriAtom, serverConfigs.drawioUri],
    [isAllReplyShownAtom, serverConfigs.isAllReplyShown],
    [showPageSideAuthorsAtom, serverConfigs.showPageSideAuthors],
    [isContainerFluidAtom, serverConfigs.isContainerFluid],
    [isEnabledStaleNotificationAtom, serverConfigs.isEnabledStaleNotification],
    [disableLinkSharingAtom, serverConfigs.disableLinkSharing],
    [isIndentSizeForcedAtom, serverConfigs.isIndentSizeForced],
    [isEnabledAttachTitleHeaderAtom, serverConfigs.isEnabledAttachTitleHeader],
    [isSearchServiceConfiguredAtom, serverConfigs.isSearchServiceConfigured],
    [isSearchServiceReachableAtom, serverConfigs.isSearchServiceReachable],
    [isSlackConfiguredAtom, serverConfigs.isSlackConfigured],
    [isAclEnabledAtom, serverConfigs.isAclEnabled],
    [isUploadAllFileAllowedAtom, serverConfigs.isUploadAllFileAllowed],
    [isUploadEnabledAtom, serverConfigs.isUploadEnabled],
    [isBulkExportPagesEnabledAtom, serverConfigs.isBulkExportPagesEnabled],
    [isPdfBulkExportEnabledAtom, serverConfigs.isPdfBulkExportEnabled],
    [isLocalAccountRegistrationEnabledAtom, serverConfigs.isLocalAccountRegistrationEnabled],
    [rendererConfigAtom, rendererConfigs],
  ]);
};
