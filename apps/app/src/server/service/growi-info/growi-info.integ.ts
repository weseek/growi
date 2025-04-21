import { mock } from 'vitest-mock-extended';

import pkg from '^/package.json';

import type UserEvent from '~/server/events/user';
import { Config } from '~/server/models/config';
import { configManager } from '~/server/service/config-manager';

import type Crowi from '../../crowi';

import { growiInfoService } from './growi-info';

describe('GrowiInfoService', () => {
  const appVersion = pkg.version;

  let User;

  beforeAll(async () => {
    process.env.APP_SITE_URL = 'http://growi.test.jp';
    process.env.DEPLOYMENT_TYPE = 'growi-docker-compose';
    process.env.SAML_ENABLED = 'true';

    await configManager.loadConfigs();
    await configManager.updateConfigs({
      'security:passport-saml:isEnabled': true,
      'security:passport-github:isEnabled': true,
    });

    await Config.create({
      key: 'app:installed',
      value: true,
      createdAt: '2000-01-01',
    });

    const crowiMock = mock<Crowi>({
      version: appVersion,
      event: vi.fn().mockImplementation((eventName) => {
        if (eventName === 'user') {
          return mock<UserEvent>({
            on: vi.fn(),
          });
        }
      }),
    });

    const userModelFactory = (await import('~/server/models/user')).default;
    User = userModelFactory(crowiMock);

    await User.deleteMany({}); // clear users
  });

  describe('getGrowiInfo', () => {
    test('Should get correct GROWI info', async () => {
      const growiInfo = await growiInfoService.getGrowiInfo();

      assert(growiInfo != null);

      expect(growiInfo.osInfo?.type).toBeTruthy();
      expect(growiInfo.osInfo?.platform).toBeTruthy();
      expect(growiInfo.osInfo?.arch).toBeTruthy();
      expect(growiInfo.osInfo?.totalmem).toBeTruthy();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (growiInfo as any).osInfo;

      expect(growiInfo).toEqual({
        version: appVersion,
        appSiteUrl: 'http://growi.test.jp',
        serviceInstanceId: '',
        type: 'on-premise',
        wikiType: 'closed',
        deploymentType: 'growi-docker-compose',
      });
    });

    test('Should get correct GROWI info with additionalInfo', async () => {
      // arrange
      await User.create({
        username: 'growiinfo test user',
        createdAt: '2000-01-01',
      });

      // act
      const growiInfo = await growiInfoService.getGrowiInfo(true);

      // assert
      assert(growiInfo != null);

      expect(growiInfo.osInfo?.type).toBeTruthy();
      expect(growiInfo.osInfo?.platform).toBeTruthy();
      expect(growiInfo.osInfo?.arch).toBeTruthy();
      expect(growiInfo.osInfo?.totalmem).toBeTruthy();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (growiInfo as any).osInfo;

      expect(growiInfo).toEqual({
        version: appVersion,
        appSiteUrl: 'http://growi.test.jp',
        serviceInstanceId: '',
        type: 'on-premise',
        wikiType: 'closed',
        deploymentType: 'growi-docker-compose',
        additionalInfo: {
          installedAt: new Date('2000-01-01'),
          installedAtByOldestUser: new Date('2000-01-01'),
          currentUsersCount: 1,
          currentActiveUsersCount: 1,
          attachmentType: 'aws',
          activeExternalAccountTypes: ['saml', 'github'],
        },
      });
    });
  });
});
