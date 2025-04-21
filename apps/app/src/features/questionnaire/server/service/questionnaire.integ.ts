import type { IGrowiInfo } from '@growi/core/dist/interfaces';
import { mock } from 'vitest-mock-extended';

import pkg from '^/package.json';

import type UserEvent from '~/server/events/user';
import { configManager } from '~/server/service/config-manager';

import type Crowi from '../../../../server/crowi';
import type { IGrowiAppAdditionalInfo } from '../../interfaces/growi-app-info';
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

  beforeAll(async () => {
    await configManager.loadConfigs();

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
    user = await User.create({
      name: 'Example for Questionnaire Service Test',
      username: 'questionnaire test user',
      email: 'questionnaireTestUser@example.com',
      password: 'usertestpass',
      createdAt: '2000-01-01',
    });

    questionnaireService = new QuestionnaireService(crowiMock);
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

    beforeAll(async () => {
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
      doc7 = await QuestionnaireOrder.create({
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
      });
      // insert data for different growi version
      doc8 = await QuestionnaireOrder.create({
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
      });
      // insert data for users that used GROWI for less than or equal to a year
      doc9 = await QuestionnaireOrder.create({
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
      });
      // insert data for users that used GROWI for more than or equal to 1000 years
      doc10 = await QuestionnaireOrder.create({
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
      });
      // insert data for users that used GROWI for more than a month and less than 6 months
      doc11 = await QuestionnaireOrder.create({
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
      });

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

    test('Should get questionnaire orders to show', async () => {
      const growiInfo = mock<IGrowiInfo<IGrowiAppAdditionalInfo>>({
        type: 'on-premise',
        version: appVersion,
      });
      const userInfo = questionnaireService.getUserInfo(user, 'appSiteUrlHashed');

      const questionnaireOrderDocuments = await questionnaireService.getQuestionnaireOrdersToShow(userInfo, growiInfo, user._id);

      expect(questionnaireOrderDocuments[0].toObject()).toMatchObject({
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
      });
    });
  });
});
