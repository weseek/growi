import QuestionnaireOrder from '../../../src/server/models/questionnaire/questionnaire-order';
import * as questionnaireCron from '../../../src/server/service/questionnaire-cron';
import axios from '../../../src/utils/axios';
import { getInstance } from '../setup-crowi';

const spyAxiosGet = jest.spyOn<typeof axios, 'get'>(
  axios,
  'get',
);

const spyGetRandomInt = jest.spyOn<typeof questionnaireCron, 'getRandomInt'>(
  questionnaireCron,
  'getRandomInt',
);

describe('QuestionnaireCronService', () => {
  let crowi;

  const maxSecondsUntilRequest = 4 * 60 * 60 * 1000;
  const secondsUntilRequest = questionnaireCron.getRandomInt(0, maxSecondsUntilRequest);

  const mockResponse = {
    data: {
      questionnaireOrders: [
        // 既に保存されている、終了していないアンケート (user types を GROWI 保存時から更新)
        {
          _id: '63a8354837e7aa378e16f0b1',
          showFrom: '2022-12-11',
          showUntil: '2100-12-12',
          questions: [
            {
              type: 'points',
              text: 'Growi は使いやすいですか？',
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
        // 保存されておらず、終了していないアンケート
        {
          _id: '63a8354837e7aa378e16f0b2',
          showFrom: '2021-12-11',
          showUntil: '2100-12-12',
          questions: [
            {
              type: 'points',
              text: 'アンケート機能は支障なく動いていますか？',
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
        // 保存されておらず、終了しているアンケート
        {
          _id: '63a8354837e7aa378e16f0b3',
          showFrom: '2021-12-11',
          showUntil: '2021-12-12',
          questions: [
            {
              type: 'points',
              text: 'これはいい質問ですか？',
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
    // 初期データ投入
    await QuestionnaireOrder.insertMany([
      {
        _id: '63a8354837e7aa378e16f0b1',
        showFrom: '2022-12-11',
        showUntil: '2100-12-12',
        questions: [
          {
            type: 'points',
            text: 'Growi は使いやすいですか？',
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
      // 終了しているアンケート
      {
        _id: '63a8354837e7aa378e16f0b4',
        showFrom: '2020-12-11',
        showUntil: '2021-12-12',
        questions: [
          {
            type: 'points',
            text: '最近どうですか？',
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
      // growi-questionnaire にないアンケート
      {
        _id: '63a8354837e7aa378e16f0b5',
        showFrom: '2020-12-11',
        showUntil: '2100-12-12',
        questions: [
          {
            type: 'points',
            text: '最新のデザインはどうですか？',
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

    // cronjob 実行の 5 秒前に現在時刻を設定する
    const mockDate = new Date(2022, 0, 1, 21, 59, 55);
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    // useFakeTimers の後でないと設定した mock 時刻が反映されない
    crowi.setupCron();

    spyAxiosGet.mockResolvedValue(mockResponse);
    spyGetRandomInt.mockReturnValue(secondsUntilRequest); // リクエストまでの待機時間を固定化
  });

  afterAll(() => {
    jest.useRealTimers();
    crowi.questionnaireCronService.stopCron();
  });

  test('Should save quesionnaire orders and delete outdated ones', async() => {
    jest.advanceTimersByTime(5 * 1000); // cronjob 実行時刻まで進める
    jest.advanceTimersByTime(secondsUntilRequest); // 待機時間分進め、リクエストを実行する
    jest.useRealTimers(); // cronjob 実行開始後は real timers に戻さないと mongoose が正常に動作しない

    await new Promise((resolve) => {
      // cronjob の実行完了を待つ
      // refs: https://github.com/node-cron/node-cron/blob/a0be3f4a7a5419af109cecf4a41071ea559b9b3d/src/task.js#L24
      crowi.questionnaireCronService.cronJob._task.once('task-finished', resolve);
    });

    const savedOrders = await QuestionnaireOrder.find()
      .select('-condition._id -questions._id')
      .sort({ _id: 1 });
    expect(JSON.parse(JSON.stringify(savedOrders))).toEqual([
      {
        _id: '63a8354837e7aa378e16f0b1',
        showFrom: '2022-12-11T00:00:00.000Z',
        showUntil: '2100-12-12T00:00:00.000Z',
        questions: [
          {
            type: 'points',
            text: 'Growi は使いやすいですか？',
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
        showFrom: '2021-12-11T00:00:00.000Z',
        showUntil: '2100-12-12T00:00:00.000Z',
        questions: [
          {
            type: 'points',
            text: 'アンケート機能は支障なく動いていますか？',
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
