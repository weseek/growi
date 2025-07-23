import * as os from 'node:os';

import type { IGrowiInfo } from '@growi/core';
import type { IUser } from '@growi/core/dist/interfaces';
import { GrowiWikiType } from '@growi/core/dist/interfaces';
import { pathUtils } from '@growi/core/dist/utils';
import type { Model } from 'mongoose';
import mongoose from 'mongoose';

import { IExternalAuthProviderType } from '~/interfaces/external-auth-provider';
import { Config } from '~/server/models/config';
import { aclService } from '~/server/service/acl';
import { configManager } from '~/server/service/config-manager';
import { getGrowiVersion } from '~/utils/growi-version';

import type { IGrowiAppAdditionalInfo } from '../../../features/questionnaire/interfaces/growi-app-info';


export class GrowiInfoService {

  /**
   * get the site url
   *
   * If the config for the site url is not set, this returns a message "[The site URL is not set. Please set it!]".
   *
   * With version 3.2.3 and below, there is no config for the site URL, so the system always uses auto-generated site URL.
   * With version 3.2.4 to 3.3.4, the system uses the auto-generated site URL only if the config is not set.
   * With version 3.3.5 and above, the system use only a value from the config.
   */
  getSiteUrl(): string {
    const siteUrl = configManager.getConfig('app:siteUrl');
    if (siteUrl != null) {
      return pathUtils.removeTrailingSlash(siteUrl);
    }
    return siteUrl ?? '[The site URL is not set. Please set it!]';
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

    const appSiteUrl = this.getSiteUrl();

    const isGuestAllowedToRead = aclService.isGuestAllowedToRead();
    const wikiType = isGuestAllowedToRead ? GrowiWikiType.open : GrowiWikiType.closed;

    const baseInfo = {
      serviceInstanceId: configManager.getConfig('app:serviceInstanceId'),
      version: getGrowiVersion(),
      osInfo: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        totalmem: os.totalmem(),
      },
      appSiteUrl,
      type: configManager.getConfig('app:serviceType'),
      wikiType,
      deploymentType: configManager.getConfig('app:deploymentType'),
    } satisfies IGrowiInfo<Record<string, never>>;

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

    const Page = mongoose.model('Page');
    const currentPagesCount = await Page.countDocuments({ isDeleted: false });

    return {
      installedAt,
      installedAtByOldestUser,
      currentUsersCount,
      currentActiveUsersCount,
      attachmentType: configManager.getConfig('app:fileUploadType'),
      activeExternalAccountTypes,
      currentPagesCount,
    };
  }

}

export const growiInfoService = new GrowiInfoService();
