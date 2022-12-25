import { IQuestionnaireOrder } from '~/interfaces/questionnaire/questionnaire-order';
import axios from '~/utils/axios';

import QuestionnaireOrder, { QuestionnaireOrderDocument } from '../models/questionnaire/questionnaire-order';

const nodeCron = require('node-cron');

const getRandomInt = (min: number, max: number): number => {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt) + minInt);
};

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

class QuestionnaireCronService {

  growiQuestionnaireUri: string;

  cronSchedule: string;

  maxHoursUntilRequest: number;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi) {
    this.growiQuestionnaireUri = crowi.configManager?.getConfig('crowi', 'app:growiQuestionnaireUri');
    this.cronSchedule = crowi.configManager?.getConfig('crowi', 'app:questionnaireCronSchedule');
    this.maxHoursUntilRequest = crowi.configManager?.getConfig('crowi', 'app:questionnaireCronMaxHoursUntilRequest');
  }

  setUpCron(): void {
    // const maxSecondsUntilRequest = this.maxHoursUntilRequest * 60 * 60;
    const maxSecondsUntilRequest = 60;
    this.questionnaireOrderGetCron(this.cronSchedule, maxSecondsUntilRequest);
  }

  questionnaireOrderGetCron(cronSchedule: string, maxSecondsUntilRequest: number): void {
    const saveOrders = async(questionnaireOrders: QuestionnaireOrderDocument[]) => {
      const savedOrders: QuestionnaireOrderDocument[] = await QuestionnaireOrder.find();
      const savedOrderIds = savedOrders.map(order => order._id.toString());
      // 渡されたアンケートのうち未保存のものを保存する
      const nonSavedOrders = questionnaireOrders.filter(order => !savedOrderIds.includes(order._id));
      QuestionnaireOrder.insertMany(nonSavedOrders);
    };

    const deleteFinishedOrders = () => {
      const currentDate = new Date(Date.now());
      QuestionnaireOrder.deleteMany({
        showUntil: {
          $lt: currentDate,
        },
      });
    };

    nodeCron.schedule(cronSchedule, async() => {
      const secToSleep = getRandomInt(0, maxSecondsUntilRequest);

      await sleep(secToSleep * 1000);

      try {
        const response = await axios.get(`${this.growiQuestionnaireUri}/questionnaire-order/index`);
        const questionnaireOrders: QuestionnaireOrderDocument[] = JSON.parse(JSON.stringify(response.data)).questionnaireQrders;

        await saveOrders(questionnaireOrders);
        deleteFinishedOrders();
      }
      catch (e) {
        console.log(e);
      }

    }).start();
  }

}

export default QuestionnaireCronService;
