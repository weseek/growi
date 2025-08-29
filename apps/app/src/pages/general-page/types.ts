import type {
  IDataWithMeta, IPageInfo, IPagePopulatedToShowRevision,
} from '@growi/core';

import type { RendererConfig } from '~/interfaces/services/renderer';
import type { ISidebarConfig } from '~/interfaces/sidebar-config';
import type { PageDocument } from '~/server/models/page';
import type { ServerConfigurationHyderateArgs } from '~/states/server-configurations/hydrate';

import type { CommonInitialProps } from '../common-props';

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

export type InitialProps = CommonInitialProps & RendererConfigProps & ServerConfigurationProps & {
  pageWithMeta: IPageToShowRevisionWithMeta | null,
  skipSSR?: boolean,

  // Page state information determined on server-side
  isNotFound: boolean,
  isForbidden: boolean,
  isNotCreatable: boolean,
}
