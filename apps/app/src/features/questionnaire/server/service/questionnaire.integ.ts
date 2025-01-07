import { Types } from 'mongoose';
import { mock } from 'vitest-mock-extended';

import pkg from '^/package.json';


import type UserEvent from '~/server/events/user';
import { Config } from '~/server/models/config';
import { configManager } from '~/server/service/config-manager';

import type Crowi from '../../../../server/crowi';
import { StatusType } from '../../interfaces/questionnaire-answer-status';
import { UserType } from '../../interfaces/user-info';
import QuestionnaireAnswerStatus from '../models/questionnaire-answer-status';
import QuestionnaireOrder from '../models/questionnaire-order';

import QuestionnaireService from './questionnaire';


describe('QuestionnaireService', () => {
  const appVersion = pkg.version;

  let questionnaireService: QuestionnaireService;

  let User;
  let user;

  beforeAll(async() => {
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
      appService: {
        getSiteUrl: () => 'http://growi.test.jp',
      },
    });
    const userModelFactory = (await import('~/server/models/user')).default;
    User = userModelFactory(crowiMock);
    questionnaireService = new QuestionnaireService(crowiMock);

    await User.deleteMany({}); // clear users
    user = await User.create({
      name: 'Example for Questionnaire Service Test',
      username: 'questionnaire test user',
      email: 'questionnaireTestUser@example.com',
      password: 'usertestpass',
      createdAt: '2000-01-01',
    });
  });

  describe('getGrowiInfo', () => {
    test('Should get correct GROWI info', async() => {
      const growiInfo = await questionnaireService.getGrowiInfo();

      assert(growiInfo != null);

      expect(growiInfo.appSiteUrlHashed).toBeTruthy();
      expect(growiInfo.appSiteUrlHashed).not.toBe('http://growi.test.jp');
      expect(growiInfo.osInfo?.type).toBeTruthy();
      expect(growiInfo.osInfo?.platform).toBeTruthy();
      expect(growiInfo.osInfo?.arch).toBeTruthy();
      expect(growiInfo.osInfo?.totalmem).toBeTruthy();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (growiInfo as any).appSiteUrlHashed;
      delete growiInfo.osInfo;

      expect(growiInfo).toEqual({
        version: appVersion,
        appSiteUrl: 'http://growi.test.jp',
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

    describe('When url hash settings is on', () => {
      beforeEach(async() => {
        process.env.QUESTIONNAIRE_IS_APP_SITE_URL_HASHED = 'true';
        await configManager.loadConfigs();
      });

      test('Should return app url string', async() => {
        const growiInfo = await questionnaireService.getGrowiInfo();
        expect(growiInfo.appSiteUrl).toBeUndefined();
        expect(growiInfo.appSiteUrlHashed).not.toBe('http://growi.test.jp');
        expect(growiInfo.appSiteUrlHashed).toBeTruthy();
      });
    });
  });

  describe('getUserInfo', () => {
    test('Should get correct user info when user given', () => {
      const userInfo = questionnaireService.getUserInfo(user, 'growiurlhashfortest');
      expect(userInfo).not.toBeNull();
      assert(userInfo != null);

      expect(userInfo.type).equal(UserType.general);
      assert(userInfo.type === UserType.general);

      expect(userInfo.userIdHash).toBeTruthy();
      expect(userInfo.userIdHash).not.toBe(user._id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (userInfo as any).userIdHash;

      expect(userInfo).toEqual({ type: 'general', userCreatedAt: new Date('2000-01-01') });
    });

    test('Should get correct user info when user is null', () => {
      const userInfo = questionnaireService.getUserInfo(null, '');
      expect(userInfo).toEqual({ type: 'guest' });
    });
  });

  describe('getQuestionnaireOrdersToShow', () => {
    let doc1;
    let doc2;
    let doc3;
    let doc4;
    let doc5;
    let doc6;
    let doc7;
    let doc8;
    let doc9;
    let doc10;
    let doc11;
    let doc12;

    beforeAll(async() => {
      const questionnaireToBeShown = {
        shortTitle: {
          ja_JP: 'GROWI に関するアンケート',
          en_US: 'Questions about GROWI',
        },
        title: {
          ja_JP: 'GROWI に関するアンケート',
          en_US: 'Questions about GROWI',
        },
        showFrom: '2022-12-11',
        showUntil: '2100-12-12',
        condition: {
          user: {
            types: ['general'],
            daysSinceCreation: {
              moreThanOrEqualTo: 365,
              lessThanOrEqualTo: 365 * 1000,
            },
          },
          growi: {
            types: ['on-premise'],
            versionRegExps: [appVersion],
          },
        },
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      };

      // insert initial db data
      doc1 = await QuestionnaireOrder.create(questionnaireToBeShown);
      // insert finished data
      doc2 = await QuestionnaireOrder.create({
        ...questionnaireToBeShown,
        showFrom: '2020-12-11',
        showUntil: '2021-12-12',
      });
      // insert data for admin or guest
      doc3 = await QuestionnaireOrder.create({
        ...questionnaireToBeShown,
        condition: {
          user: {
            types: ['admin', 'guest'],
          },
          growi: {
            types: ['on-premise'],
            versionRegExps: [appVersion],
          },
        },
      });
      // insert answered data
      doc4 = await QuestionnaireOrder.create(questionnaireToBeShown);
      // insert skipped data
      doc5 = await QuestionnaireOrder.create(questionnaireToBeShown);
      // insert denied data
      doc6 = await QuestionnaireOrder.create(questionnaireToBeShown);
      // insert data for different growi type
      doc7 = await QuestionnaireOrder.create(
        {
          ...questionnaireToBeShown,
          condition: {
            user: {
              types: ['general'],
            },
            growi: {
              types: ['cloud'],
              versionRegExps: [appVersion],
            },
          },
        },
      );
      // insert data for different growi version
      doc8 = await QuestionnaireOrder.create(
        {
          ...questionnaireToBeShown,
          condition: {
            user: {
              types: ['general'],
            },
            growi: {
              types: ['on-premise'],
              versionRegExps: ['1.0.0-alpha'],
            },
          },
        },
      );
      // insert data for users that used GROWI for less than or equal to a year
      doc9 = await QuestionnaireOrder.create(
        {
          ...questionnaireToBeShown,
          condition: {
            user: {
              types: ['general'],
              daysSinceCreation: {
                lessThanOrEqualTo: 365,
              },
            },
            growi: {
              types: ['on-premise'],
              versionRegExps: [appVersion],
            },
          },
        },
      );
      // insert data for users that used GROWI for more than or equal to 1000 years
      doc10 = await QuestionnaireOrder.create(
        {
          ...questionnaireToBeShown,
          condition: {
            user: {
              types: ['general'],
              daysSinceCreation: {
                moreThanOrEqualTo: 365 * 1000,
              },
            },
            growi: {
              types: ['on-premise'],
              versionRegExps: [appVersion],
            },
          },
        },
      );
      // insert data for users that used GROWI for more than a month and less than 6 months
      doc11 = await QuestionnaireOrder.create(
        {
          ...questionnaireToBeShown,
          condition: {
            user: {
              types: ['general'],
              daysSinceCreation: {
                moreThanOrEqualTo: 30,
                lessThanOrEqualTo: 30 * 6,
              },
            },
            growi: {
              types: ['on-premise'],
              versionRegExps: [appVersion],
            },
          },
        },
      );

      await QuestionnaireAnswerStatus.insertMany([
        {
          user: user._id,
          questionnaireOrderId: doc4._id,
          status: StatusType.answered,
        },
        {
          user: user._id,
          questionnaireOrderId: doc5._id,
          status: StatusType.skipped,
        },
        {
          user: user._id,
          questionnaireOrderId: doc6._id,
          status: StatusType.skipped,
        },
      ]);
    });

    test('Should get questionnaire orders to show', async() => {
      const growiInfo = await questionnaireService.getGrowiInfo();
      const userInfo = questionnaireService.getUserInfo(user, growiInfo.appSiteUrlHashed);

      const questionnaireOrderDocuments = await questionnaireService.getQuestionnaireOrdersToShow(userInfo, growiInfo, user._id);

      expect(questionnaireOrderDocuments[0].toObject()).toMatchObject(
        {
          __v: 0,
          shortTitle: {
            ja_JP: 'GROWI に関するアンケート',
            en_US: 'Questions about GROWI',
          },
          title: {
            ja_JP: 'GROWI に関するアンケート',
            en_US: 'Questions about GROWI',
          },
          showFrom: new Date('2022-12-11'),
          showUntil: new Date('2100-12-12'),
          questions: [],
          condition: {
            user: {
              types: ['general'],
              daysSinceCreation: {
                moreThanOrEqualTo: 365,
                lessThanOrEqualTo: 365 * 1000,
              },
            },
            growi: {
              types: ['on-premise'],
              versionRegExps: [appVersion],
            },
          },
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      );

    });

  });

});
