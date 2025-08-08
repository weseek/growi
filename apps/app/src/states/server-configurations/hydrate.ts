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
export type ServerConfigurationInitialProps = {
  aiEnabled: boolean;
  limitLearnablePageCountPerAssistant: number;
  isUsersHomepageDeletionEnabled: boolean;
  adminPreferredIndentSize: number;
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
  isSearchServiceConfigured: boolean;
  isSearchServiceReachable: boolean;
  isSlackConfigured: boolean;
  isAclEnabled: boolean;
  isUploadAllFileAllowed: boolean;
  isUploadEnabled: boolean;
  isBulkExportPagesEnabled: boolean;
  isPdfBulkExportEnabled: boolean;
  isLocalAccountRegistrationEnabled: boolean;
  rendererConfig: RendererConfig;
};

/**
 * Hook for hydrating server configuration atoms with server-side data
 * This should be called early in the app component to ensure atoms are properly initialized before rendering
 *
 * @param serverConfigProps - Server-side server configuration properties
 */
export const useHydrateServerConfigurationAtoms = (serverConfigProps: ServerConfigurationInitialProps): void => {
  // Hydrate server configuration atoms with server-side data
  useHydrateAtoms([
    [aiEnabledAtom, serverConfigProps.aiEnabled],
    [limitLearnablePageCountPerAssistantAtom, serverConfigProps.limitLearnablePageCountPerAssistant],
    [isUsersHomepageDeletionEnabledAtom, serverConfigProps.isUsersHomepageDeletionEnabled],
    [defaultIndentSizeAtom, serverConfigProps.adminPreferredIndentSize],
    [isSearchScopeChildrenAsDefaultAtom, serverConfigProps.isSearchScopeChildrenAsDefault],
    [elasticsearchMaxBodyLengthToIndexAtom, serverConfigProps.elasticsearchMaxBodyLengthToIndex],
    [isRomUserAllowedToCommentAtom, serverConfigProps.isRomUserAllowedToComment],
    [drawioUriAtom, serverConfigProps.drawioUri],
    [isAllReplyShownAtom, serverConfigProps.isAllReplyShown],
    [showPageSideAuthorsAtom, serverConfigProps.showPageSideAuthors],
    [isContainerFluidAtom, serverConfigProps.isContainerFluid],
    [isEnabledStaleNotificationAtom, serverConfigProps.isEnabledStaleNotification],
    [disableLinkSharingAtom, serverConfigProps.disableLinkSharing],
    [isIndentSizeForcedAtom, serverConfigProps.isIndentSizeForced],
    [isEnabledAttachTitleHeaderAtom, serverConfigProps.isEnabledAttachTitleHeader],
    [isSearchServiceConfiguredAtom, serverConfigProps.isSearchServiceConfigured],
    [isSearchServiceReachableAtom, serverConfigProps.isSearchServiceReachable],
    [isSlackConfiguredAtom, serverConfigProps.isSlackConfigured],
    [isAclEnabledAtom, serverConfigProps.isAclEnabled],
    [isUploadAllFileAllowedAtom, serverConfigProps.isUploadAllFileAllowed],
    [isUploadEnabledAtom, serverConfigProps.isUploadEnabled],
    [isBulkExportPagesEnabledAtom, serverConfigProps.isBulkExportPagesEnabled],
    [isPdfBulkExportEnabledAtom, serverConfigProps.isPdfBulkExportEnabled],
    [isLocalAccountRegistrationEnabledAtom, serverConfigProps.isLocalAccountRegistrationEnabled],
    [rendererConfigAtom, serverConfigProps.rendererConfig],
  ]);
};
