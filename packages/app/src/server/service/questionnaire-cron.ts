import axios from '~/utils/axios';
import { getRandomIntInRange } from '~/utils/rand';
import { sleep } from '~/utils/sleep';

const nodeCron = require('node-cron');

class QuestionnaireCronService {

  crowi: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi) {
    this.crowi = crowi;
  }

  setUpCron(): void {
    const cronSchedule = this.crowi.configManager?.getConfig('crowi', 'app:questionnaireCronSchedule');
    const maxHoursUntilRequest = this.crowi.configManager?.getConfig('crowi', 'app:questionnaireCronMaxHoursUntilRequest');

    const maxSecondsUntilRequest = maxHoursUntilRequest * 60 * 60;
    this.questionnaireOrderGetCron(cronSchedule, maxSecondsUntilRequest);
  }

  questionnaireOrderGetCron(cronSchedule: string, maxSecondsUntilRequest: number): void {
    const growiQuestionnaireServerOrigin = this.crowi.configManager?.getConfig('crowi', 'app:growiQuestionnaireServerOrigin');
    nodeCron.schedule(cronSchedule, async() => {
      const secToSleep = getRandomIntInRange(0, maxSecondsUntilRequest);

      await sleep(secToSleep * 1000);

      try {
        const response = await axios.get(`${growiQuestionnaireServerOrigin}/questionnaire-order/index`);
        console.log(response.data);
      }
      catch (e) {
        console.log(e);
      }

    }).start();
  }

}

export default QuestionnaireCronService;
