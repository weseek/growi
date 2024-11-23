import type * as os from 'node:os';

import { IExternalAuthProviderType } from '@growi/core';

import type { AttachmentMethodType } from '~/interfaces/attachment';
import type { GrowiDeploymentType, GrowiServiceType } from '~/interfaces/system';

export const GrowiWikiType = { open: 'open', closed: 'closed' } as const;
type GrowiWikiType = typeof GrowiWikiType[keyof typeof GrowiWikiType]

export const GrowiExternalAuthProviderType = IExternalAuthProviderType;
export type GrowiExternalAuthProviderType = typeof GrowiExternalAuthProviderType[keyof typeof GrowiExternalAuthProviderType]

interface IGrowiOSInfo {
  type?: ReturnType<typeof os.type>
  platform?: ReturnType<typeof os.platform>
  arch?: ReturnType<typeof os.arch>
  totalmem?: ReturnType<typeof os.totalmem>
}

export interface IGrowiInfo {
  version: string
  appSiteUrl?: string
  appSiteUrlHashed: string
  installedAt: Date
  installedAtByOldestUser: Date
  type: GrowiServiceType
  currentUsersCount: number
  currentActiveUsersCount: number
  wikiType: GrowiWikiType
  attachmentType: AttachmentMethodType
  activeExternalAccountTypes?: GrowiExternalAuthProviderType[]
  osInfo?: IGrowiOSInfo
  deploymentType?: GrowiDeploymentType
}
