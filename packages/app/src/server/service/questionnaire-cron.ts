import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';

import QuestionnaireOrder, { QuestionnaireOrderDocument } from '../models/questionnaire/questionnaire-order';

const logger = loggerFactory('growi:service:questionnaire-cron');

const nodeCron = require('node-cron');

export const getRandomInt = (min: number, max: number): number => {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt) + minInt);
};

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

class QuestionnaireCronService {

  growiQuestionnaireUri: string;

  cronSchedule: string;

  maxHoursUntilRequest: number;

  cronJob;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi) {
    this.growiQuestionnaireUri = crowi.configManager?.getConfig('crowi', 'app:growiQuestionnaireUri');
    this.cronSchedule = crowi.configManager?.getConfig('crowi', 'app:questionnaireCronSchedule');
    this.maxHoursUntilRequest = crowi.configManager?.getConfig('crowi', 'app:questionnaireCronMaxHoursUntilRequest');

    const maxSecondsUntilRequest = this.maxHoursUntilRequest * 60 * 60;

    this.cronJob = this.questionnaireOrderGetCron(this.cronSchedule, maxSecondsUntilRequest);
  }

  startCron(): void {
    this.cronJob.start();
  }

  stopCron(): void {
    this.cronJob.stop();
  }

  private questionnaireOrderGetCron(cronSchedule: string, maxSecondsUntilRequest: number) {
    const saveOrders = async(questionnaireOrders: QuestionnaireOrderDocument[]) => {
      const savedOrders: QuestionnaireOrderDocument[] = await QuestionnaireOrder.find();
      const savedOrderIds = savedOrders.map(order => order._id.toString());
      // 渡されたアンケートのうち未保存のものを保存する
      const nonSavedOrders = questionnaireOrders.filter(order => !savedOrderIds.includes(order._id));
      await QuestionnaireOrder.insertMany(nonSavedOrders);
    };

    const deleteFinishedOrders = async() => {
      const currentDate = new Date(Date.now());

      await QuestionnaireOrder.deleteMany({
        showUntil: {
          $lt: currentDate,
        },
      });
    };

    return nodeCron.schedule(cronSchedule, async() => {
      // GROWI ごとにリクエスト時刻を分散させるためにランダムな時間 sleep する
      const secToSleep = getRandomInt(0, maxSecondsUntilRequest);
      await sleep(secToSleep * 1000);

      try {
        const response = await axios.get(`${this.growiQuestionnaireUri}/questionnaire-order/index`);
        const questionnaireOrders: QuestionnaireOrderDocument[] = response.data.questionnaireOrders;

        await saveOrders(questionnaireOrders);
        deleteFinishedOrders();
      }
      catch (e) {
        logger.error(e);
      }

    });
  }

}

export default QuestionnaireCronService;
