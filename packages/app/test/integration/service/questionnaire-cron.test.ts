import QuestionnaireOrder from '../../../src/server/models/questionnaire/questionnaire-order';
import { getInstance } from '../setup-crowi';

const axios = require('axios').default;

const rand = require('../../../src/utils/rand');

const spyAxiosGet = jest.spyOn<typeof axios, 'get'>(
  axios,
  'get',
);

const spyGetRandomIntInRange = jest.spyOn<typeof rand, 'getRandomIntInRange'>(
  rand,
  'getRandomIntInRange',
);

describe('QuestionnaireCronService', () => {
  let crowi;

  const maxSecondsUntilRequest = 4 * 60 * 60 * 1000;
  const secondsUntilRequest = rand.getRandomIntInRange(0, maxSecondsUntilRequest);

  const mockResponse = {
    data: {
      questionnaireOrders: [
        // saved in db、not finished (user types is updated from the time it was saved)
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
    process.env.QUESTIONNAIRE_CRON_SCHEDULE = '0 22 * * *';
    process.env.QUESTIONNAIRE_CRON_MAX_HOURS_UNTIL_REQUEST = '4';

    crowi = await getInstance();
    // reload
    await crowi.setupConfigManager();
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

    // mock the date to 5 seconds before cronjob execution
    const mockDate = new Date(2022, 0, 1, 21, 59, 55);
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    // must be after useFakeTimers for mockDate to be in effect
    crowi.setupCron();

    spyAxiosGet.mockResolvedValue(mockResponse);
    spyGetRandomIntInRange.mockReturnValue(secondsUntilRequest); // static sleep time until request
  });

  afterAll(() => {
    jest.useRealTimers();
    crowi.questionnaireCronService.stopCron();
  });

  test('Should save quesionnaire orders and delete outdated ones', async() => {
    jest.advanceTimersByTime(5 * 1000); // advance unitl cronjob execution
    jest.advanceTimersByTime(secondsUntilRequest); // advance until request execution
    jest.useRealTimers(); // after cronjob starts, undo timer mocks so mongoose can work properly

    await new Promise((resolve) => {
      // wait until cronjob execution finishes
      // refs: https://github.com/node-cron/node-cron/blob/a0be3f4a7a5419af109cecf4a41071ea559b9b3d/src/task.js#L24
      crowi.questionnaireCronService.cronJob._task.once('task-finished', resolve);
    });

    const savedOrders = await QuestionnaireOrder.find()
      .select('-condition._id -questions._id')
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
  });
});
