import type {
  IDataWithMeta, IPageInfo, IPagePopulatedToShowRevision,
} from '@growi/core';

import type { RendererConfig } from '~/interfaces/services/renderer';
import type { ISidebarConfig } from '~/interfaces/sidebar-config';
import type { CommonEachProps, CommonInitialProps } from '~/pages/utils/commons';
import type { PageTitleCustomizationProps } from '~/pages/utils/page-title-customization';
import type { SSRProps } from '~/pages/utils/ssr';
import type { UserUISettingsProps } from '~/pages/utils/user-ui-settings';
import type { PageDocument } from '~/server/models/page';

export type IPageToShowRevisionWithMeta = IDataWithMeta<IPagePopulatedToShowRevision & PageDocument, IPageInfo>;

export type InitialProps = CommonInitialProps & SSRProps & UserUISettingsProps & {
  pageWithMeta: IPageToShowRevisionWithMeta | null,

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
