import * as os from 'node:os';

export const GrowiServiceType = {
  cloud: 'cloud',
  privateCloud: 'private-cloud',
  onPremise: 'on-premise',
  others: 'others',
} as const;
export const GrowiWikiType = { open: 'open', closed: 'closed' } as const;
export const GrowiAttachmentType = {
  aws: 'aws',
  gcs: 'gcs',
  gcp: 'gcp',
  gridfs: 'gridfs',
  mongo: 'mongo',
  mongodb: 'mongodb',
  local: 'local',
  none: 'none',
} as const;
export const GrowiDeploymentType = {
  officialHelmChart: 'official-helm-chart',
  growiDockerCompose: 'growi-docker-compose',
  node: 'node',
  others: 'others',
} as const;
export const GrowiExternalAuthProviderType = {
  ldap: 'ldap',
  saml: 'saml',
  oicd: 'oidc',
  google: 'google',
  github: 'github',
} as const;

export type GrowiServiceType = typeof GrowiServiceType[keyof typeof GrowiServiceType]
type GrowiWikiType = typeof GrowiWikiType[keyof typeof GrowiWikiType]
export type GrowiAttachmentType = typeof GrowiAttachmentType[keyof typeof GrowiAttachmentType]
export type GrowiDeploymentType = typeof GrowiDeploymentType[keyof typeof GrowiDeploymentType]
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
  type: GrowiServiceType
  currentUsersCount: number
  currentActiveUsersCount: number
  wikiType: GrowiWikiType
  attachmentType: GrowiAttachmentType
  activeExternalAccountTypes?: GrowiExternalAuthProviderType[]
  osInfo?: IGrowiOSInfo
  deploymentType?: GrowiDeploymentType
}
