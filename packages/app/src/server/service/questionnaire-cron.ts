import axiosRetry from 'axios-retry';

import { IQuestionnaireOrder } from '~/interfaces/questionnaire/questionnaire-order';
import loggerFactory from '~/utils/logger';
import { getRandomIntInRange } from '~/utils/rand';
import { sleep } from '~/utils/sleep';

import QuestionnaireOrder from '../models/questionnaire/questionnaire-order';

const logger = loggerFactory('growi:service:questionnaire-cron');

const axios = require('axios').default;
const nodeCron = require('node-cron');

axiosRetry(axios, { retries: 3 });

class QuestionnaireCronService {

  crowi: any;

  cronJob: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi) {
    this.crowi = crowi;
  }

  startCron(): void {
    const cronSchedule = this.crowi.configManager?.getConfig('crowi', 'app:questionnaireCronSchedule');
    const maxHoursUntilRequest = this.crowi.configManager?.getConfig('crowi', 'app:questionnaireCronMaxHoursUntilRequest');

    const maxSecondsUntilRequest = maxHoursUntilRequest * 60 * 60;
    this.cronJob = this.questionnaireOrderGetCron(cronSchedule, maxSecondsUntilRequest);
    this.cronJob.start();
  }

  stopCron(): void {
    this.cronJob.stop();
  }

  private questionnaireOrderGetCron(cronSchedule: string, maxSecondsUntilRequest: number) {
    const growiQuestionnaireServerOrigin = this.crowi.configManager?.getConfig('crowi', 'app:growiQuestionnaireServerOrigin');
    const saveOrders = async(questionnaireOrders: IQuestionnaireOrder[]) => {
      const currentDate = new Date(Date.now());
      // save questionnaires that are not finished (doesn't have to be started)
      const nonFinishedOrders = questionnaireOrders.filter(order => new Date(order.showUntil) > currentDate);
      await QuestionnaireOrder.insertMany(nonFinishedOrders);
    };

    return nodeCron.schedule(cronSchedule, async() => {
      // sleep for a random amount to scatter request time from GROWI apps to questionnaire server
      const secToSleep = getRandomIntInRange(0, maxSecondsUntilRequest);
      await sleep(secToSleep * 1000);

      try {
        const response = await axios.get(`${growiQuestionnaireServerOrigin}/questionnaire-order/index`);
        const questionnaireOrders: IQuestionnaireOrder[] = response.data.questionnaireOrders;

        await QuestionnaireOrder.deleteMany();
        await saveOrders(questionnaireOrders);
      }
      catch (e) {
        logger.error(e);
      }

    });
  }

}

export default QuestionnaireCronService;
