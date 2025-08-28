import type {
  IDataWithMeta, IPageInfo, IPagePopulatedToShowRevision,
} from '@growi/core';

import type { RendererConfig } from '~/interfaces/services/renderer';
import type { ISidebarConfig } from '~/interfaces/sidebar-config';
import type { CommonEachProps, CommonInitialProps } from '~/pages/utils/commons';
import type { UserUISettingsProps } from '~/pages/utils/user-ui-settings';
import type { PageDocument } from '~/server/models/page';
import type { ServerConfigurationHyderateArgs } from '~/states/server-configurations/hydrate';


export type IPageToShowRevisionWithMeta = IDataWithMeta<IPagePopulatedToShowRevision & PageDocument, IPageInfo>;

export type SidebarConfigProps = {
  sidebarConfig: ISidebarConfig,
}

export type RendererConfigProps = {
  rendererConfig: RendererConfig,
}

export type ServerConfigurationProps = {
  serverConfig: ServerConfigurationHyderateArgs,
}

export type InitialProps = CommonInitialProps & UserUISettingsProps & SidebarConfigProps & RendererConfigProps & ServerConfigurationProps & {
  pageWithMeta: IPageToShowRevisionWithMeta | null,
  skipSSR?: boolean,

  // Page state information determined on server-side
  isNotFound: boolean,
  isForbidden: boolean,
  isNotCreatable: boolean,
}

export type SameRouteEachProps = CommonEachProps & {
  redirectFrom?: string;

  isIdenticalPathPage: boolean,

  templateTagData?: string[],
  templateBodyData?: string,
}

export type Props = SameRouteEachProps | (InitialProps & SameRouteEachProps);
