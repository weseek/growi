import type * as os from 'node:os';

import type { GrowiDeploymentType, GrowiServiceType } from '../consts/system';

export const GrowiWikiType = { open: 'open', closed: 'closed' } as const;
type GrowiWikiType = (typeof GrowiWikiType)[keyof typeof GrowiWikiType];

interface IGrowiOSInfo {
  type?: ReturnType<typeof os.type>;
  platform?: ReturnType<typeof os.platform>;
  arch?: ReturnType<typeof os.arch>;
  totalmem?: ReturnType<typeof os.totalmem>;
}

export interface IGrowiAdditionalInfo {
  installedAt: Date;
  installedAtByOldestUser: Date | null;
  currentUsersCount: number;
  currentActiveUsersCount: number;
}

export interface IGrowiInfo<A extends object = IGrowiAdditionalInfo> {
  serviceInstanceId: string;
  appSiteUrl: string;
  osInfo: IGrowiOSInfo;
  version: string;
  type: GrowiServiceType;
  wikiType: GrowiWikiType;
  deploymentType: GrowiDeploymentType;
  additionalInfo?: A;
}
