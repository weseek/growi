import mongoose from 'mongoose';

import { IProactiveQuestionnaireAnswer } from '../../../src/features/questionnaire/interfaces/proactive-questionnaire-answer';
import { IQuestionnaireAnswer } from '../../../src/features/questionnaire/interfaces/questionnaire-answer';
import { StatusType } from '../../../src/features/questionnaire/interfaces/questionnaire-answer-status';
import ProactiveQuestionnaireAnswer from '../../../src/features/questionnaire/server/models/proactive-questionnaire-answer';
import QuestionnaireAnswer from '../../../src/features/questionnaire/server/models/questionnaire-answer';
import QuestionnaireAnswerStatus from '../../../src/features/questionnaire/server/models/questionnaire-answer-status';
import QuestionnaireOrder from '../../../src/features/questionnaire/server/models/questionnaire-order';
import { getInstance } from '../setup-crowi';

const axios = require('axios').default;

const spyAxiosGet = jest.spyOn<typeof axios, 'get'>(
  axios,
  'get',
);

const spyAxiosPost = jest.spyOn<typeof axios, 'post'>(
  axios,
  'post',
);

describe('QuestionnaireCronService', () => {
  let crowi;

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

  beforeAll(async() => {
    crowi = await getInstance();
  });

  beforeEach(async() => {
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
      answers: [{
        question: '63c6da88143e531d95346188',
        value: '1',
      }],
      answeredAt: new Date(),
      growiInfo: {
        version: '1.0',
        appSiteUrlHashed: 'c83e8d2a1aa87b2a3f90561be372ca523bb931e2d00013c1d204879621a25b90',
        type: 'cloud',
        currentUsersCount: 100,
        currentActiveUsersCount: 50,
        wikiType: 'open',
        attachmentType: 'aws',
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
    ]);

    const validProactiveQuestionnaireAnswer: IProactiveQuestionnaireAnswer = {
      satisfaction: 1,
      commentText: 'answer text',
      growiInfo: {
        version: '1.0',
        appSiteUrlHashed: 'c83e8d2a1aa87b2a3f90561be372ca523bb931e2d00013c1d204879621a25b90',
        type: 'cloud',
        currentUsersCount: 100,
        currentActiveUsersCount: 50,
        wikiType: 'open',
        attachmentType: 'aws',
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
    ]);

    crowi.setupCron();

    spyAxiosGet.mockResolvedValue(mockResponse);
    spyAxiosPost.mockResolvedValue({ data: { result: 'success' } });
  });

  afterAll(() => {
    crowi.questionnaireCronService.stopCron(); // jest will not finish until cronjob stops
  });

  test('Job execution should save(update) quesionnaire orders, delete outdated ones, update skipped answer statuses, and delete resent answers', async() => {
    // testing the cronjob from schedule has untrivial overhead, so test job execution in place
    await crowi.questionnaireCronService.executeJob();

    const savedOrders = await QuestionnaireOrder.find()
      .select('-condition._id -questions._id -questions.createdAt -questions.updatedAt')
      .sort({ _id: 1 });
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
