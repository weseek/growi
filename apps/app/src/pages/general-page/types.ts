import type {
  IDataWithMeta, IPageInfo, IPagePopulatedToShowRevision,
} from '@growi/core';

import type { RendererConfig } from '~/interfaces/services/renderer';
import type { ISidebarConfig } from '~/interfaces/sidebar-config';
import type { PageDocument } from '~/server/models/page';

import type { CommonInitialProps } from '../common-props';

export type IPageToShowRevisionWithMeta = IDataWithMeta<IPagePopulatedToShowRevision & PageDocument, IPageInfo>;

export type SidebarConfigProps = {
  sidebarConfig: ISidebarConfig,
}

export type RendererConfigProps = {
  rendererConfig: RendererConfig,
}

export type ServerConfigurationProps = {
  serverConfig: {
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
  },
}

export type GeneralPageInitialProps = CommonInitialProps & RendererConfigProps & ServerConfigurationProps & {
  pageWithMeta: IPageToShowRevisionWithMeta | null,
  skipSSR?: boolean,

  // Page state information determined on server-side
  isNotFound: boolean,
  isForbidden: boolean,
  isNotCreatable: boolean,
}
