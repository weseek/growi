import { GrowiDeploymentType, GrowiServiceType } from '@growi/core/dist/consts';
import type { IGrowiInfo } from '@growi/core/dist/interfaces';
import { GrowiWikiType } from '@growi/core/dist/interfaces';
import { describe, test, expect } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { AttachmentMethodType } from '../../../../interfaces/attachment';
import type { IGrowiAppAdditionalInfo, IGrowiAppInfoLegacy } from '../../interfaces/growi-app-info';

import { convertToLegacyFormat } from './convert-to-legacy-format';

describe('convertToLegacyFormat', () => {
  test('should return same object when input is already in legacy format', () => {
    const growiInfoLegacy: IGrowiAppInfoLegacy = {
      version: '1.0.0',
      appSiteUrl: 'https://example.com',
      appSiteUrlHashed: '100680ad546ce6a577f42f52df33b4cfdca756859e664b8d7de329b150d09ce9',
      serviceInstanceId: 'service-instance-id',
      type: GrowiServiceType.cloud,
      wikiType: GrowiWikiType.open,
      deploymentType: GrowiDeploymentType.others,
      osInfo: {
        type: 'Linux',
        platform: 'linux',
        arch: 'x64',
        totalmem: 8589934592,
      },

      // legacy properties
      installedAt: new Date(),
      installedAtByOldestUser: new Date(),
      currentUsersCount: 1,
      currentActiveUsersCount: 1,
      attachmentType: AttachmentMethodType.local,
    };

    const legacyData = {
      someData: 'test',
      growiInfo: growiInfoLegacy,
    };

    const result = convertToLegacyFormat(legacyData);
    expect(result).toStrictEqual(legacyData);
  });

  test('should convert new format to legacy format', () => {
    const installedAt = new Date();
    const installedAtByOldestUser = new Date();

    const growiInfo: IGrowiInfo<IGrowiAppAdditionalInfo> = {
      version: '1.0.0',
      appSiteUrl: 'https://example.com',
      serviceInstanceId: 'service-instance-id',
      type: GrowiServiceType.cloud,
      wikiType: GrowiWikiType.open,
      deploymentType: GrowiDeploymentType.others,
      osInfo: {
        type: 'Linux',
        platform: 'linux',
        arch: 'x64',
        totalmem: 8589934592,
      },
      additionalInfo: {
        installedAt,
        installedAtByOldestUser,
        currentUsersCount: 1,
        currentActiveUsersCount: 1,
        attachmentType: AttachmentMethodType.local,
      },
    };
    const newFormatData = {
      someData: 'test',
      growiInfo,
    };

    const growiInfoLegacy: IGrowiAppInfoLegacy = {
      version: '1.0.0',
      appSiteUrl: 'https://example.com',
      appSiteUrlHashed: '100680ad546ce6a577f42f52df33b4cfdca756859e664b8d7de329b150d09ce9',
      serviceInstanceId: 'service-instance-id',
      type: GrowiServiceType.cloud,
      wikiType: GrowiWikiType.open,
      deploymentType: GrowiDeploymentType.others,
      osInfo: {
        type: 'Linux',
        platform: 'linux',
        arch: 'x64',
        totalmem: 8589934592,
      },

      // legacy properties
      installedAt,
      installedAtByOldestUser,
      currentUsersCount: 1,
      currentActiveUsersCount: 1,
      attachmentType: AttachmentMethodType.local,
    };
    const expected = {
      someData: 'test',
      growiInfo: growiInfoLegacy,
    };

    const result = convertToLegacyFormat(newFormatData);
    expect(result).toStrictEqual(expected);
  });

  test('should convert new format and omit appSiteUrl', () => {
    // arrange
    const growiInfo = mock<IGrowiInfo<IGrowiAppAdditionalInfo>>({
      appSiteUrl: 'https://example.com',
      additionalInfo: {
        installedAt: new Date(),
        installedAtByOldestUser: new Date(),
        currentUsersCount: 1,
        currentActiveUsersCount: 1,
        attachmentType: AttachmentMethodType.local,
      },
    });

    // act
    const result = convertToLegacyFormat({ growiInfo }, true);

    // assert
    expect(result.growiInfo.appSiteUrl).toBeUndefined();
  });
});
