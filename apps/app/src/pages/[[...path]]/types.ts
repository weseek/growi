import type {
  IDataWithMeta, IPageInfo, IPagePopulatedToShowRevision,
} from '@growi/core';

import type { RendererConfig } from '~/interfaces/services/renderer';
import type { ISidebarConfig } from '~/interfaces/sidebar-config';
import type { CommonEachProps, CommonInitialProps } from '~/pages/utils/commons';
import type { PageTitleCustomizationProps } from '~/pages/utils/page-title-customization';
import type { UserUISettingsProps } from '~/pages/utils/user-ui-settings';
import type { PageDocument } from '~/server/models/page';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:pages:[[...path]]:types');


export type IPageToShowRevisionWithMeta = IDataWithMeta<IPagePopulatedToShowRevision & PageDocument, IPageInfo>;

export type InitialProps = CommonInitialProps & UserUISettingsProps & {
  pageWithMeta: IPageToShowRevisionWithMeta | null,
  skipSSR?: boolean,

  sidebarConfig: ISidebarConfig,
  rendererConfig: RendererConfig,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  elasticsearchMaxBodyLengthToIndex: number,
  isEnabledMarp: boolean,

  isRomUserAllowedToComment: boolean,

  isSlackConfigured: boolean,
  isAclEnabled: boolean,
  drawioUri: string | null,
  isAllReplyShown: boolean,
  showPageSideAuthors: boolean,

  isContainerFluid: boolean,
  isUploadEnabled: boolean,
  isUploadAllFileAllowed: boolean,
  isBulkExportPagesEnabled: boolean,
  isPdfBulkExportEnabled: boolean,
  isEnabledStaleNotification: boolean,
  isEnabledAttachTitleHeader: boolean,
  isUsersHomepageDeletionEnabled: boolean,
  isLocalAccountRegistrationEnabled: boolean,

  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
  disableLinkSharing: boolean,

  aiEnabled: boolean,
  limitLearnablePageCountPerAssistant: number,

  // Page state information determined on server-side
  isNotFound: boolean,
  isForbidden: boolean,
  isNotCreatable: boolean,
}

export type SameRouteEachProps = CommonEachProps & PageTitleCustomizationProps & {
  redirectFrom?: string;

  isIdenticalPathPage: boolean,

  templateTagData?: string[],
  templateBodyData?: string,
}

export type Props = SameRouteEachProps | (InitialProps & SameRouteEachProps);

// Helper types for extended props
export type ExtendedInitialProps = InitialProps & SameRouteEachProps;

/**
 * Type guard for SameRouteEachProps validation
 * Lightweight validation for same-route navigation
 */
export function isValidSameRouteProps(props: unknown): props is SameRouteEachProps {
  if (typeof props !== 'object' || props === null) {
    logger.warn('isValidSameRouteProps: props is not an object or is null');
    return false;
  }

  const p = props as Record<string, unknown>;

  // Essential properties validation
  if (typeof p.appTitle !== 'string') {
    logger.warn('isValidSameRouteProps: appTitle is not a string', { appTitle: p.appTitle });
    return false;
  }
  if (typeof p.currentPathname !== 'string') {
    logger.warn('isValidSameRouteProps: currentPathname is not a string', { currentPathname: p.currentPathname });
    return false;
  }
  if (typeof p.csrfToken !== 'string') {
    logger.warn('isValidSameRouteProps: csrfToken is not a string', { csrfToken: p.csrfToken });
    return false;
  }
  if (typeof p.isMaintenanceMode !== 'boolean') {
    logger.warn('isValidSameRouteProps: isMaintenanceMode is not a boolean', { isMaintenanceMode: p.isMaintenanceMode });
    return false;
  }
  if (typeof p.isIdenticalPathPage !== 'boolean') {
    logger.warn('isValidSameRouteProps: isIdenticalPathPage is not a boolean', { isIdenticalPathPage: p.isIdenticalPathPage });
    return false;
  }

  return true;
}

/**
 * Type guard for InitialProps & SameRouteEachProps validation
 * First validates SameRouteEachProps, then checks InitialProps-specific properties
 */
export function isValidInitialAndSameRouteProps(props: unknown): props is InitialProps & SameRouteEachProps {
  // First, validate SameRouteEachProps
  if (!isValidSameRouteProps(props)) {
    logger.warn('isValidInitialAndSameRouteProps: SameRouteEachProps validation failed');
    return false;
  }

  const p = props as Record<string, unknown>;

  // Then validate InitialProps-specific properties
  // CommonInitialProps
  if (p.isNextjsRoutingTypeInitial !== true) {
    logger.warn('isValidInitialAndSameRouteProps: isNextjsRoutingTypeInitial is not true', { isNextjsRoutingTypeInitial: p.isNextjsRoutingTypeInitial });
    return false;
  }
  if (typeof p.growiVersion !== 'string') {
    logger.warn('isValidInitialAndSameRouteProps: growiVersion is not a string', { growiVersion: p.growiVersion });
    return false;
  }

  // SSRProps
  if (typeof p.skipSSR !== 'boolean') {
    logger.warn('isValidInitialAndSameRouteProps: skipSSR is not a boolean', { skipSSR: p.skipSSR });
    return false;
  }

  // InitialProps specific page state
  if (typeof p.isNotFound !== 'boolean') {
    logger.warn('isValidInitialAndSameRouteProps: isNotFound is not a boolean', { isNotFound: p.isNotFound });
    return false;
  }
  if (typeof p.isForbidden !== 'boolean') {
    logger.warn('isValidInitialAndSameRouteProps: isForbidden is not a boolean', { isForbidden: p.isForbidden });
    return false;
  }
  if (typeof p.isNotCreatable !== 'boolean') {
    logger.warn('isValidInitialAndSameRouteProps: isNotCreatable is not a boolean', { isNotCreatable: p.isNotCreatable });
    return false;
  }

  return true;
}
