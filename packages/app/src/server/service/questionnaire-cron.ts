import axios from '~/utils/axios';

import QuestionnaireOrder, { QuestionnaireOrderDocument } from '../models/questionnaire/questionnaire-order';

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
    // const maxSecondsUntilRequest = 60;
    // this.cronSchedule = '* * * * *';

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
      console.log(savedOrderIds);
      console.log(questionnaireOrders);
      // 渡されたアンケートのうち未保存のものを保存する
      const nonSavedOrders = questionnaireOrders.filter(order => !savedOrderIds.includes(order._id));
      QuestionnaireOrder.insertMany(nonSavedOrders);
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
      console.log('called');
      const secToSleep = getRandomInt(0, maxSecondsUntilRequest);

      await sleep(secToSleep * 1000);

      console.log('executed');

      try {
        const response = await axios.get(`${this.growiQuestionnaireUri}/questionnaire-order/index`);
        const questionnaireOrders: QuestionnaireOrderDocument[] = response.data.questionnaireOrders;

        await saveOrders(questionnaireOrders);
        await deleteFinishedOrders();
      }
      catch (e) {
        console.log(e);
      }

    });
  }

}

export default QuestionnaireCronService;
