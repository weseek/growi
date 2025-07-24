import type * as os from 'node:os';

import type { GrowiDeploymentType, GrowiServiceType } from '../consts/system';

export const GrowiWikiType = { open: 'open', closed: 'closed' } as const;
type GrowiWikiType = (typeof GrowiWikiType)[keyof typeof GrowiWikiType];

// Info options for additionalInfo selection
export interface GrowiInfoOptions {
  includeAttachment?: boolean;
  includeInstalledInfo?: boolean;
  includeUserCount?: boolean;
  // Future extensions can be added here
  // includePageCount?: boolean;
}

interface IGrowiOSInfo {
  type?: ReturnType<typeof os.type>;
  platform?: ReturnType<typeof os.platform>;
  arch?: ReturnType<typeof os.arch>;
  totalmem?: ReturnType<typeof os.totalmem>;
}

export interface IAttachmentInfo {
  attachmentType: string;
  activeExternalAccountTypes: string[];
}

export interface IInstalledAtInfo {
  installedAt: Date;
  installedAtByOldestUser: Date | null;
}

export interface IUserCountInfo {
  currentUsersCount: number;
  currentActiveUsersCount: number;
}

export interface IGrowiAdditionalInfo extends IInstalledAtInfo, IUserCountInfo, IAttachmentInfo {
}

// Type mapping for flexible options
export type IGrowiAdditionalInfoByOptions<T extends GrowiInfoOptions> =
  (T['includeAttachment'] extends true ? IAttachmentInfo : {}) &
  (T['includeInstalledInfo'] extends true ? IInstalledAtInfo : {}) &
  (T['includeUserCount'] extends true ? IUserCountInfo : {});

// Helper type to check if any option is enabled
export type HasAnyOption<T extends GrowiInfoOptions> =
  T['includeAttachment'] extends true ? true :
  T['includeInstalledInfo'] extends true ? true :
  T['includeUserCount'] extends true ? true :
  false;

// Final result type based on options
export type IGrowiAdditionalInfoResult<T extends GrowiInfoOptions> =
  HasAnyOption<T> extends true ? IGrowiAdditionalInfoByOptions<T> : undefined;

export interface IGrowiInfo<A extends object | undefined = undefined> {
  serviceInstanceId: string;
  appSiteUrl: string;
  osInfo: IGrowiOSInfo;
  version: string;
  type: GrowiServiceType;
  wikiType: GrowiWikiType;
  deploymentType: GrowiDeploymentType;
  additionalInfo?: A;
}
