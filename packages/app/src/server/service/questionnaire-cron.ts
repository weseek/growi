import axios from '~/utils/axios';
import { sleep } from '~/utils/sleep';

const nodeCron = require('node-cron');

const getRandomInt = (min: number, max: number): number => {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt) + minInt);
};

class QuestionnaireCronService {

  growiQuestionnaireServerOrigin: string;

  cronSchedule: string;

  maxHoursUntilRequest: number;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi) {
    this.growiQuestionnaireServerOrigin = crowi.configManager?.getConfig('crowi', 'app:growiQuestionnaireServerOrigin');
    this.cronSchedule = crowi.configManager?.getConfig('crowi', 'app:questionnaireCronSchedule');
    this.maxHoursUntilRequest = crowi.configManager?.getConfig('crowi', 'app:questionnaireCronMaxHoursUntilRequest');
  }

  setUpCron(): void {
    const maxSecondsUntilRequest = this.maxHoursUntilRequest * 60 * 60;
    this.questionnaireOrderGetCron(this.cronSchedule, maxSecondsUntilRequest);
  }

  questionnaireOrderGetCron(cronSchedule: string, maxSecondsUntilRequest: number): void {
    nodeCron.schedule(cronSchedule, async() => {
      const secToSleep = getRandomInt(0, maxSecondsUntilRequest);

      await sleep(secToSleep * 1000);

      try {
        const response = await axios.get(`${this.growiQuestionnaireServerOrigin}/questionnaire-order/index`);
        console.log(response.data);
      }
      catch (e) {
        console.log(e);
      }

    }).start();
  }

}

export default QuestionnaireCronService;
