import * as os from 'node:os';

import type {
  IGrowiInfo,
  GrowiInfoOptions,
  IGrowiAdditionalInfoResult,
} from '@growi/core';
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

// Local preset for full additional info
const FULL_ADDITIONAL_INFO_OPTIONS = {
  includeAttachment: true,
  includeInstalledInfo: true,
  includeUserCount: true,
} as const;


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
  getGrowiInfo(): Promise<IGrowiInfo<undefined>>;

  /**
   * Get GROWI information with flexible options
   * @param options options to determine what additional information to include
   */
  getGrowiInfo<T extends GrowiInfoOptions>(options: T): Promise<IGrowiInfo<IGrowiAdditionalInfoResult<T>>>;

  /**
   * Get GROWI information with additional information (legacy)
   * @param includeAdditionalInfo whether to include additional information
   * @deprecated Use getGrowiInfo(options) instead
   */
  getGrowiInfo(includeAdditionalInfo: true): Promise<IGrowiInfo<IGrowiAdditionalInfoResult<typeof FULL_ADDITIONAL_INFO_OPTIONS>>>;

  async getGrowiInfo<T extends GrowiInfoOptions>(
      optionsOrLegacyFlag?: T | boolean,
  ): Promise<IGrowiInfo<IGrowiAdditionalInfoResult<T>>> {

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
    } satisfies IGrowiInfo<undefined>;

    if (optionsOrLegacyFlag == null) {
      return baseInfo;
    }

    let options: GrowiInfoOptions;

    // Handle different parameter types
    if (typeof optionsOrLegacyFlag === 'boolean') {
      // Legacy boolean parameter
      options = optionsOrLegacyFlag ? FULL_ADDITIONAL_INFO_OPTIONS : {};
    }
    else {
      // GrowiInfoOptions parameter
      options = optionsOrLegacyFlag;
    }

    const additionalInfo = await this.getAdditionalInfoByOptions(options);

    if (!additionalInfo) {
      return baseInfo as IGrowiInfo<IGrowiAdditionalInfoResult<T>>;
    }

    return {
      ...baseInfo,
      additionalInfo,
    } as IGrowiInfo<IGrowiAdditionalInfoResult<T>>;
  }

  private async getAdditionalInfoByOptions<T extends GrowiInfoOptions>(options: T): Promise<IGrowiAdditionalInfoResult<T>> {
    const User = mongoose.model<IUser, Model<IUser>>('User');

    const result: Record<string, unknown> = {};

    // Always include attachment info if any option is enabled
    if (options.includeAttachment || options.includeInstalledInfo || options.includeUserCount) {
      const activeExternalAccountTypes: IExternalAuthProviderType[] = Object.values(IExternalAuthProviderType).filter((type) => {
        return configManager.getConfig(`security:passport-${type}:isEnabled`);
      });

      result.attachmentType = configManager.getConfig('app:fileUploadType');
      result.activeExternalAccountTypes = activeExternalAccountTypes;
    }

    if (options.includeInstalledInfo) {
      // Get the oldest user who probably installed this GROWI.
      const user = await User.findOne({ createdAt: { $ne: null } }).sort({ createdAt: 1 });
      const installedAtByOldestUser = user ? user.createdAt : null;

      const appInstalledConfig = await Config.findOne({ key: 'app:installed' });
      const oldestConfig = await Config.findOne().sort({ createdAt: 1 });
      const installedAt = installedAtByOldestUser ?? appInstalledConfig?.createdAt ?? oldestConfig?.createdAt ?? null;

      result.installedAt = installedAt;
      result.installedAtByOldestUser = installedAtByOldestUser;
    }

    if (options.includeUserCount) {
      const currentUsersCount = await User.countDocuments();
      const currentActiveUsersCount = await (User as unknown as { countActiveUsers: () => Promise<number> }).countActiveUsers();

      result.currentUsersCount = currentUsersCount;
      result.currentActiveUsersCount = currentActiveUsersCount;
    }

    return (Object.keys(result).length > 0 ? result : undefined) as IGrowiAdditionalInfoResult<T>;
  }

}

export const growiInfoService = new GrowiInfoService();
