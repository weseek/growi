import { GrowiDeploymentType, GrowiServiceType, GrowiWikiType } from '@growi/core';
// eslint-disable-next-line no-restricted-imports
import axios from 'axios';
import mongoose from 'mongoose';

import { configManager } from '~/server/service/config-manager';

import { AttachmentMethodType } from '../../../../interfaces/attachment';
import type { IProactiveQuestionnaireAnswer, IProactiveQuestionnaireAnswerLegacy } from '../../interfaces/proactive-questionnaire-answer';
import type { IQuestionnaireAnswer, IQuestionnaireAnswerLegacy } from '../../interfaces/questionnaire-answer';
import { StatusType } from '../../interfaces/questionnaire-answer-status';
import ProactiveQuestionnaireAnswer from '../models/proactive-questionnaire-answer';
import QuestionnaireAnswer from '../models/questionnaire-answer';
import QuestionnaireAnswerStatus from '../models/questionnaire-answer-status';
import QuestionnaireOrder from '../models/questionnaire-order';

import questionnaireCronService from './questionnaire-cron';

// TODO: use actual user model after ~/server/models/user.js becomes importable in vitest
// ref: https://github.com/vitest-dev/vitest/issues/846
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
  },
);
const User = mongoose.model('User', userSchema);

describe('QuestionnaireCronService', () => {
  const mockResponse = {
    data: {
      questionnaireOrders: [
        // saved in db、not finished (user.types is updated from the time it was saved)
        {
          _id: '63a8354837e7aa378e16f0b1',
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
          questions: [
            {
              type: 'points',
              text: {
                ja_JP: 'GROWI は使いやすいですか？',
                en_US: 'Is GROWI easy to use?',
              },
            },
          ],
          condition: {
            user: {
              types: ['admin', 'general'],
            },
            growi: {
              types: ['cloud', 'private-cloud'],
              versionRegExps: ['2\\.0\\.[0-9]', '1\\.9\\.[0-9]'],
            },
          },
          createdAt: '2022-12-01',
          updatedAt: '2022-12-01',
          __v: 0,
        },
        // not saved, not finished
        {
          _id: '63a8354837e7aa378e16f0b2',
          shortTitle: {
            ja_JP: 'GROWI に関するアンケート',
            en_US: 'Questions about GROWI',
          },
          title: {
            ja_JP: 'GROWI に関するアンケート',
            en_US: 'Questions about GROWI',
          },
          showFrom: '2021-12-11',
          showUntil: '2100-12-12',
          questions: [
            {
              type: 'points',
              text: {
                ja_JP: 'アンケート機能は正常動作していますか？',
                en_US: 'Is this questionnaire functioning properly?',
              },
            },
          ],
          condition: {
            user: {
              types: ['general'],
            },
            growi: {
              types: ['cloud'],
              versionRegExps: ['2\\.0\\.[0-9]', '1\\.9\\.[0-9]'],
            },
          },
          createdAt: '2022-12-02',
          updatedAt: '2022-12-02',
          __v: 0,
        },
        // not saved, finished
        {
          _id: '63a8354837e7aa378e16f0b3',
          shortTitle: {
            ja_JP: 'GROWI に関するアンケート',
            en_US: 'Questions about GROWI',
          },
          title: {
            ja_JP: 'GROWI に関するアンケート',
            en_US: 'Questions about GROWI',
          },
          showFrom: '2021-12-11',
          showUntil: '2021-12-12',
          questions: [
            {
              type: 'points',
              text: {
                ja_JP: 'これはいい質問ですか？',
                en_US: 'Is this a good question?',
              },
            },
          ],
          condition: {
            user: {
              types: ['general'],
            },
            growi: {
              types: ['cloud'],
              versionRegExps: ['2\\.0\\.[0-9]', '1\\.9\\.[0-9]'],
            },
          },
          createdAt: '2022-12-03',
          updatedAt: '2022-12-03',
          __v: 0,
        },
      ],
    },
  };

  beforeAll(async () => {
    await configManager.loadConfigs();
    await configManager.updateConfig('app:questionnaireCronMaxHoursUntilRequest', 0);
    await User.create({
      name: 'Example for Questionnaire Service Test',
      username: 'questionnaire cron test user',
      email: 'questionnaireCronTestUser@example.com',
      createdAt: '2020-01-01',
    });
  });

  beforeEach(async () => {
    // insert initial db data
    await QuestionnaireOrder.insertMany([
      {
        _id: '63a8354837e7aa378e16f0b1',
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
        questions: [
          {
            type: 'points',
            text: {
              ja_JP: 'GROWI は使いやすいですか？',
              en_US: 'Is GROWI easy to use?',
            },
          },
        ],
        condition: {
          user: {
            types: ['general'],
          },
          growi: {
            types: ['cloud', 'private-cloud'],
            versionRegExps: ['2\\.0\\.[0-9]', '1\\.9\\.[0-9]'],
          },
        },
      },
      // finished
      {
        _id: '63a8354837e7aa378e16f0b4',
        shortTitle: {
          ja_JP: 'GROWI に関するアンケート',
          en_US: 'Questions about GROWI',
        },
        title: {
          ja_JP: 'GROWI に関するアンケート',
          en_US: 'Questions about GROWI',
        },
        showFrom: '2020-12-11',
        showUntil: '2021-12-12',
        questions: [
          {
            type: 'points',
            text: {
              ja_JP: 'ver 2.0 は 1.0 より良いですか？',
              en_US: 'Is ver 2.0 better than 1.0?',
            },
          },
        ],
        condition: {
          user: {
            types: ['general'],
          },
          growi: {
            types: ['cloud'],
            versionRegExps: ['2\\.0\\.[0-9]', '1\\.9\\.[0-9]'],
          },
        },
      },
      // questionnaire that doesn't exist in questionnaire server
      {
        _id: '63a8354837e7aa378e16f0b5',
        shortTitle: {
          ja_JP: 'GROWI に関するアンケート',
          en_US: 'Questions about GROWI',
        },
        title: {
          ja_JP: 'GROWI に関するアンケート',
          en_US: 'Questions about GROWI',
        },
        showFrom: '2020-12-11',
        showUntil: '2100-12-12',
        questions: [
          {
            type: 'points',
            text: {
              ja_JP: '新しいデザインは良いですか？',
              en_US: 'How would you rate the latest design?',
            },
          },
        ],
        condition: {
          user: {
            types: ['general'],
          },
          growi: {
            types: ['cloud'],
            versionRegExps: ['2\\.0\\.[0-9]', '1\\.9\\.[0-9]'],
          },
        },
      },
    ]);

    await QuestionnaireAnswerStatus.insertMany([
      {
        user: new mongoose.Types.ObjectId(),
        questionnaireOrderId: '63a8354837e7aa378e16f0b1',
        status: StatusType.skipped,
      },
      {
        user: new mongoose.Types.ObjectId(),
        questionnaireOrderId: '63a8354837e7aa378e16f0b1',
        status: StatusType.answered,
      },
      {
        user: new mongoose.Types.ObjectId(),
        questionnaireOrderId: '63a8354837e7aa378e16f0b1',
        status: StatusType.not_answered,
      },
    ]);

    const validQuestionnaireAnswer: IQuestionnaireAnswer = {
      answers: [
        {
          question: '63c6da88143e531d95346188',
          value: '1',
        },
      ],
      answeredAt: new Date(),
      growiInfo: {
        version: '1.0',
        appSiteUrl: 'https://example.com',
        serviceInstanceId: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
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
          installedAt: new Date('2000-01-01'),
          installedAtByOldestUser: new Date('2020-01-01'),
          currentUsersCount: 100,
          currentActiveUsersCount: 50,
          attachmentType: AttachmentMethodType.aws,
        },
      },
      userInfo: {
        userIdHash: '542bcc3bc5bc61b840017a18',
        type: 'general',
        userCreatedAt: new Date(),
      },
      questionnaireOrder: '63a8354837e7aa378e16f0b1',
    };

    const validQuestionnaireAnswerLegacy: IQuestionnaireAnswerLegacy = {
      answers: [
        {
          question: '63c6da88143e531d95346188',
          value: '1',
        },
      ],
      answeredAt: new Date(),
      growiInfo: {
        version: '1.0',
        appSiteUrl: 'https://example.com',
        appSiteUrlHashed: 'hashed',
        serviceInstanceId: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
        type: GrowiServiceType.cloud,
        wikiType: GrowiWikiType.open,
        deploymentType: GrowiDeploymentType.others,
        installedAt: new Date('2000-01-01'),
        installedAtByOldestUser: new Date('2020-01-01'),
        currentUsersCount: 100,
        currentActiveUsersCount: 50,
        osInfo: {
          type: 'Linux',
          platform: 'linux',
          arch: 'x64',
          totalmem: 8589934592,
        },
        attachmentType: AttachmentMethodType.aws,
      },
      userInfo: {
        userIdHash: '542bcc3bc5bc61b840017a18',
        type: 'general',
        userCreatedAt: new Date(),
      },
      questionnaireOrder: '63a8354837e7aa378e16f0b1',
    };

    await QuestionnaireAnswer.insertMany([
      validQuestionnaireAnswer,
      validQuestionnaireAnswer,
      validQuestionnaireAnswer,
      validQuestionnaireAnswerLegacy,
      validQuestionnaireAnswerLegacy,
    ]);

    const validProactiveQuestionnaireAnswer: IProactiveQuestionnaireAnswer = {
      satisfaction: 1,
      commentText: 'answer text',
      growiInfo: {
        version: '1.0',
        appSiteUrl: 'https://example.com',
        serviceInstanceId: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
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
          installedAt: new Date('2000-01-01'),
          installedAtByOldestUser: new Date('2020-01-01'),
          currentUsersCount: 100,
          currentActiveUsersCount: 50,
          attachmentType: AttachmentMethodType.aws,
        },
      },
      userInfo: {
        userIdHash: '542bcc3bc5bc61b840017a18',
        type: 'general',
        userCreatedAt: new Date(),
      },
      answeredAt: new Date(),
    };
    const validProactiveQuestionnaireAnswerLegacy: IProactiveQuestionnaireAnswerLegacy = {
      satisfaction: 1,
      commentText: 'answer text',
      growiInfo: {
        version: '1.0',
        appSiteUrl: 'https://example.com',
        appSiteUrlHashed: 'hashed',
        serviceInstanceId: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
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
        installedAt: new Date('2000-01-01'),
        installedAtByOldestUser: new Date('2020-01-01'),
        currentUsersCount: 100,
        currentActiveUsersCount: 50,
        attachmentType: AttachmentMethodType.aws,
      },
      userInfo: {
        userIdHash: '542bcc3bc5bc61b840017a18',
        type: 'general',
        userCreatedAt: new Date(),
      },
      answeredAt: new Date(),
    };

    await ProactiveQuestionnaireAnswer.insertMany([
      validProactiveQuestionnaireAnswer,
      validProactiveQuestionnaireAnswer,
      validProactiveQuestionnaireAnswer,
      validProactiveQuestionnaireAnswerLegacy,
      validProactiveQuestionnaireAnswerLegacy,
    ]);

    questionnaireCronService.startCron();

    vi.spyOn(axios, 'get').mockResolvedValue(mockResponse);
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { result: 'success' } });
  });

  afterAll(() => {
    questionnaireCronService.stopCron(); // vitest will not finish until cronjob stops
  });

  test('Job execution should save(update) quesionnaire orders, delete outdated ones, update skipped answer statuses, and delete resent answers', async () => {
    // testing the cronjob from schedule has untrivial overhead, so test job execution in place
    await questionnaireCronService.executeJob();

    const savedOrders = await QuestionnaireOrder.find().select('-condition._id -questions._id -questions.createdAt -questions.updatedAt').sort({ _id: 1 });

    expect(JSON.parse(JSON.stringify(savedOrders))).toEqual([
      {
        _id: '63a8354837e7aa378e16f0b1',
        shortTitle: {
          ja_JP: 'GROWI に関するアンケート',
          en_US: 'Questions about GROWI',
        },
        title: {
          ja_JP: 'GROWI に関するアンケート',
          en_US: 'Questions about GROWI',
        },
        showFrom: '2022-12-11T00:00:00.000Z',
        showUntil: '2100-12-12T00:00:00.000Z',
        questions: [
          {
            type: 'points',
            text: {
              ja_JP: 'GROWI は使いやすいですか？',
              en_US: 'Is GROWI easy to use?',
            },
          },
        ],
        condition: {
          user: {
            types: ['admin', 'general'],
          },
          growi: {
            types: ['cloud', 'private-cloud'],
            versionRegExps: ['2\\.0\\.[0-9]', '1\\.9\\.[0-9]'],
          },
        },
        createdAt: '2022-12-01T00:00:00.000Z',
        updatedAt: '2022-12-01T00:00:00.000Z',
        __v: 0,
      },
      {
        _id: '63a8354837e7aa378e16f0b2',
        shortTitle: {
          ja_JP: 'GROWI に関するアンケート',
          en_US: 'Questions about GROWI',
        },
        title: {
          ja_JP: 'GROWI に関するアンケート',
          en_US: 'Questions about GROWI',
        },
        showFrom: '2021-12-11T00:00:00.000Z',
        showUntil: '2100-12-12T00:00:00.000Z',
        questions: [
          {
            type: 'points',
            text: {
              ja_JP: 'アンケート機能は正常動作していますか？',
              en_US: 'Is this questionnaire functioning properly?',
            },
          },
        ],
        condition: {
          user: {
            types: ['general'],
          },
          growi: {
            types: ['cloud'],
            versionRegExps: ['2\\.0\\.[0-9]', '1\\.9\\.[0-9]'],
          },
        },
        createdAt: '2022-12-02T00:00:00.000Z',
        updatedAt: '2022-12-02T00:00:00.000Z',
        __v: 0,
      },
    ]);

    expect((await QuestionnaireAnswerStatus.find({ status: StatusType.not_answered })).length).toEqual(2);
    expect((await QuestionnaireAnswer.find()).length).toEqual(0);
    expect((await ProactiveQuestionnaireAnswer.find()).length).toEqual(0);
  });
});
