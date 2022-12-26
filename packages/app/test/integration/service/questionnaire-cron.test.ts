import QuestionnaireOrder from '../../../src/server/models/questionnaire/questionnaire-order';
import axios from '../../../src/utils/axios';
import { getInstance } from '../setup-crowi';


const spyAxiosGet = jest.spyOn<typeof axios, 'get'>(
  axios,
  'get',
);

describe('QuestionnaireCronService', () => {
  let crowi;

  const mockResponse = {
    data: {
      questionnaireOrders: [
        // 既に保存されている
        {
          _id: '63a8354837e7aa378e16f0b1',
          showFrom: '2022-12-11',
          showUntil: '2023-12-12',
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
        },
        // 新しいアンケート
        {
          _id: '63a8354837e7aa378e16f0b2',
          showFrom: '2021-12-11',
          showUntil: '2022-12-12',
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

    // await QuestionnaireOrder.insertMany([
    //   {
    //     _id: '63a8354837e7aa378e16f0b1',
    //     showFrom: '2021-12-11',
    //     showUntil: '2022-12-12',
    //     questions: [
    //       {
    //         type: 'points',
    //         text: 'アンケート機能は支障なく動いていますか？',
    //       },
    //     ],
    //     condition: {
    //       user: {
    //         types: ['general'],
    //       },
    //       growi: {
    //         types: ['cloud'],
    //         versionRegExps: ['2\\.0\\.[0-9]', '1\\.9\\.[0-9]'],
    //       },
    //     },
    //   },
    //   {
    //     _id: '63a8354837e7aa378e16f0b3',
    //     showFrom: '2020-12-11',
    //     showUntil: '2021-12-12',
    //     questions: [
    //       {
    //         type: 'points',
    //         text: '最近どうですか？',
    //       },
    //     ],
    //     condition: {
    //       user: {
    //         types: ['general'],
    //       },
    //       growi: {
    //         types: ['cloud'],
    //         versionRegExps: ['2\\.0\\.[0-9]', '1\\.9\\.[0-9]'],
    //       },
    //     },
    //   },
    // ]);

    const mockDate = new Date(2022, 0, 1, 21, 59, 55); // cronjob 実行の 5 秒前
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    // useFakeTimers の後でないと設定した mock 時刻が反映されない
    crowi.setupCron();
  });

  afterAll(() => {
    jest.useRealTimers();
    crowi.questionnaireCronService.stopCron();
  });

  describe('test test', () => {
    test('hoge', async() => {
      spyAxiosGet.mockResolvedValue(mockResponse);
      jest.advanceTimersByTime(5 * 1000); // cronjob 実行時刻まで進める
      jest.advanceTimersByTime(4 * 60 * 60 * 1000); // 待機時間の最大値まで進め、リクエストを実行する
      // const savedOrders = await QuestionnaireOrder.find();
      // const savedIds: string[] = savedOrders.map(order => order._id.toString());
      const savedIds = ['a'];
      expect(savedIds.sort()).toEqual(['63a8354837e7aa378e16f0b1', '63a8354837e7aa378e16f0b2']);
    });
  });
});
