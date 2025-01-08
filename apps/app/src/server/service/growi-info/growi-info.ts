import crypto from 'crypto';
import * as os from 'node:os';

import type { IGrowiInfo } from '@growi/core';
import type { IUser } from '@growi/core/dist/interfaces';
import { GrowiWikiType } from '@growi/core/dist/interfaces';
import type { Model } from 'mongoose';
import mongoose from 'mongoose';

import { IExternalAuthProviderType } from '~/interfaces/external-auth-provider';
import type Crowi from '~/server/crowi';
import { Config } from '~/server/models/config';
import { aclService } from '~/server/service/acl';
import { configManager } from '~/server/service/config-manager';
import { getGrowiVersion } from '~/utils/growi-version';

import type { IGrowiAppAdditionalInfo } from '../../../features/questionnaire/interfaces/growi-app-info';


export class GrowiInfoService {

  crowi: Crowi;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
  }

  /**
   * Get GROWI information
   */
  getGrowiInfo(): Promise<IGrowiInfo<Record<string, never>>>;

  /**
   * Get GROWI information with additional information
   * @param includeAdditionalInfo whether to include additional information
   */
  getGrowiInfo(includeAdditionalInfo: true): Promise<IGrowiInfo<IGrowiAppAdditionalInfo>>;

  async getGrowiInfo(includeAdditionalInfo?: boolean): Promise<IGrowiInfo<Record<string, never>> | IGrowiInfo<IGrowiAppAdditionalInfo>> {

    const appSiteUrl = this.crowi.appService.getSiteUrl();
    const hasher = crypto.createHash('sha256');
    hasher.update(appSiteUrl);
    const appSiteUrlHashed = hasher.digest('hex');

    const isGuestAllowedToRead = aclService.isGuestAllowedToRead();
    const wikiType = isGuestAllowedToRead ? GrowiWikiType.open : GrowiWikiType.closed;

    const baseInfo = {
      version: getGrowiVersion(),
      osInfo: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        totalmem: os.totalmem(),
      },
      appSiteUrl: configManager.getConfig('questionnaire:isAppSiteUrlHashed') ? undefined : appSiteUrl,
      appSiteUrlHashed,
      type: configManager.getConfig('app:serviceType'),
      wikiType,
      deploymentType: configManager.getConfig('app:deploymentType'),
    };

    if (!includeAdditionalInfo) {
      return baseInfo;
    }

    return {
      ...baseInfo,
      additionalInfo: await this.getAdditionalInfo(),
    };
  }

  private async getAdditionalInfo(): Promise<IGrowiAppAdditionalInfo> {
    const User = mongoose.model<IUser, Model<IUser>>('User');

    // Get the oldest user who probably installed this GROWI.
    const user = await User.findOne({ createdAt: { $ne: null } }).sort({ createdAt: 1 });
    const installedAtByOldestUser = user ? user.createdAt : null;

    const appInstalledConfig = await Config.findOne({ key: 'app:installed' });
    const oldestConfig = await Config.findOne().sort({ createdAt: 1 });
    const installedAt = installedAtByOldestUser ?? appInstalledConfig?.createdAt ?? oldestConfig!.createdAt ?? null;

    const currentUsersCount = await User.countDocuments();
    const currentActiveUsersCount = await (User as any).countActiveUsers();

    const activeExternalAccountTypes: IExternalAuthProviderType[] = Object.values(IExternalAuthProviderType).filter((type) => {
      return configManager.getConfig(`security:passport-${type}:isEnabled`);
    });

    return {
      installedAt,
      installedAtByOldestUser,
      currentUsersCount,
      currentActiveUsersCount,
      attachmentType: configManager.getConfig('app:fileUploadType'),
      activeExternalAccountTypes,
    };
  }

}

let _instance: GrowiInfoService;

export const serviceFactory = (crowi: Crowi): GrowiInfoService => {
  if (_instance == null) {
    _instance = new GrowiInfoService(crowi);
  }

  return _instance;
};

export const getInstance = (): GrowiInfoService => {
  return _instance;
};
