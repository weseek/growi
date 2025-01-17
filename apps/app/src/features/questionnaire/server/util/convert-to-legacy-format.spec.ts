import { GrowiDeploymentType, GrowiServiceType } from '@growi/core/dist/consts';
import type { IGrowiInfo } from '@growi/core/dist/interfaces';
import { GrowiWikiType } from '@growi/core/dist/interfaces';
import { describe, test, expect } from 'vitest';

import { AttachmentMethodType } from '../../../../interfaces/attachment';
import type { IGrowiAppAdditionalInfo, IGrowiAppInfoLegacy } from '../../interfaces/growi-app-info';

import { convertToLegacyFormat } from './convert-to-legacy-format';

describe('convertToLegacyFormat', () => {
  test('should return same object when input is already in legacy format', () => {
    const growiInfoLegacy: IGrowiAppInfoLegacy = {
      version: '1.0.0',
      appSiteUrl: 'https://example.com',
      appSiteUrlHashed: 'hashedUrl',
      type: GrowiServiceType.cloud,
      wikiType: GrowiWikiType.open,
      deploymentType: GrowiDeploymentType.others,

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
    const growiInfo: IGrowiInfo<IGrowiAppAdditionalInfo> = {
      version: '1.0.0',
      appSiteUrl: 'https://example.com',
      appSiteUrlHashed: 'hashedUrl',
      type: GrowiServiceType.cloud,
      wikiType: GrowiWikiType.open,
      deploymentType: GrowiDeploymentType.others,

      additionalInfo: {
        installedAt: new Date(),
        installedAtByOldestUser: new Date(),
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
      appSiteUrlHashed: 'hashedUrl',
      type: GrowiServiceType.cloud,
      wikiType: GrowiWikiType.open,
      deploymentType: GrowiDeploymentType.others,

      // legacy properties
      installedAt: new Date(),
      installedAtByOldestUser: new Date(),
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
});
