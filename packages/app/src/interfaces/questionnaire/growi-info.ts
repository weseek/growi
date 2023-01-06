import * as os from 'node:os';

export const GrowiServiceType = {
  cloud: 'cloud',
  privateCloud: 'private-cloud',
  onPremise: 'on-premise',
  others: 'others',
} as const;
const GrowiWikiType = { open: 'open', closed: 'closed' } as const;
const GrowiAttachmentType = {
  aws: 'aws',
  gcs: 'gcs',
  gridfs: 'gridfs',
  local: 'local',
  none: 'none',
} as const;
const GrowiDeploymentType = {
  officialHelmChart: 'official-helm-chart',
  growiDockerCompose: 'growi-docker-compose',
  node: 'node',
  others: 'others',
} as const;

export type GrowiServiceType = typeof GrowiServiceType[keyof typeof GrowiServiceType]
type GrowiWikiType = typeof GrowiWikiType[keyof typeof GrowiWikiType]
type GrowiAttachmentType = typeof GrowiAttachmentType[keyof typeof GrowiAttachmentType]
type GrowiDeploymentType = typeof GrowiDeploymentType[keyof typeof GrowiDeploymentType]

interface IGrowiOSInfo {
  type?: ReturnType<typeof os.type>
  platform?: ReturnType<typeof os.platform>
  arch?: ReturnType<typeof os.arch>
  totalmem?: ReturnType<typeof os.totalmem>
}

export interface IGrowiInfo {
  version: string
  appSiteUrl: string // it may be hashed
  type: GrowiServiceType
  currentUsersCount: number
  currentActiveUsersCount: number
  wikiType: GrowiWikiType
  attachmentType: GrowiAttachmentType
  activeExternalAccountTypes?: string
  osInfo?: IGrowiOSInfo
  deploymentType?: GrowiDeploymentType
}
