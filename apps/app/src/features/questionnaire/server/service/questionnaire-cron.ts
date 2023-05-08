import axiosRetry from 'axios-retry';

import loggerFactory from '~/utils/logger';
import { getRandomIntInRange } from '~/utils/rand';

import { StatusType } from '../../interfaces/questionnaire-answer-status';
import { IQuestionnaireOrder } from '../../interfaces/questionnaire-order';
import ProactiveQuestionnaireAnswer from '../models/proactive-questionnaire-answer';
import QuestionnaireAnswer from '../models/questionnaire-answer';
import QuestionnaireAnswerStatus from '../models/questionnaire-answer-status';
import QuestionnaireOrder from '../models/questionnaire-order';

const logger = loggerFactory('growi:service:questionnaire-cron');

const axios = require('axios').default;
const nodeCron = require('node-cron');

axiosRetry(axios, { retries: 3 });

/**
 * manage cronjob which
 *  1. fetches QuestionnaireOrders from questionnaire server
 *  2. updates QuestionnaireOrder collection to contain only the ones that exist in the fetched list and is not finished (doesn't have to be started)
 *  3. changes QuestionnaireAnswerStatuses which are 'skipped' to 'not_answered'
 *  4. resend QuestionnaireAnswers & ProactiveQuestionnaireAnswers which failed to reach questionnaire server
 */
class QuestionnaireCronService {

  crowi: any;

  cronJob: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi) {
    this.crowi = crowi;
  }

  sleep = (msec: number): Promise<void> => new Promise(resolve => setTimeout(resolve, msec));

  startCron(): void {
    const cronSchedule = this.crowi.configManager?.getConfig('crowi', 'app:questionnaireCronSchedule');
    const maxHoursUntilRequest = this.crowi.configManager?.getConfig('crowi', 'app:questionnaireCronMaxHoursUntilRequest');

    const maxSecondsUntilRequest = maxHoursUntilRequest * 60 * 60;

    this.cronJob?.stop();
    this.cronJob = this.generateCronJob(cronSchedule, maxSecondsUntilRequest);
    this.cronJob.start();
  }

  stopCron(): void {
    this.cronJob.stop();
  }

  async executeJob(): Promise<void> {
    const questionnaireServerOrigin = this.crowi.configManager?.getConfig('crowi', 'app:questionnaireServerOrigin');

    const fetchQuestionnaireOrders = async(): Promise<IQuestionnaireOrder[]> => {
      const response = await axios.get(`${questionnaireServerOrigin}/questionnaire-order/index`);
      return response.data.questionnaireOrders;
    };

    const saveUnfinishedOrders = async(questionnaireOrders: IQuestionnaireOrder[]) => {
      const currentDate = new Date(Date.now());
      const unfinishedOrders = questionnaireOrders.filter(order => new Date(order.showUntil) > currentDate);
      await QuestionnaireOrder.insertMany(unfinishedOrders);
    };

    const changeSkippedAnswerStatusToNotAnswered = async() => {
      await QuestionnaireAnswerStatus.updateMany(
        { status: StatusType.skipped },
        { status: StatusType.not_answered },
      );
    };

    const resendQuestionnaireAnswers = async() => {
      const questionnaireAnswers = await QuestionnaireAnswer.find()
        .select('-_id -answers._id  -growiInfo._id -userInfo._id');
      const proactiveQuestionnaireAnswers = await ProactiveQuestionnaireAnswer.find()
        .select('-_id -growiInfo._id -userInfo._id');

      axios.post(`${questionnaireServerOrigin}/questionnaire-answer/batch`, { questionnaireAnswers })
        .then(async() => {
          await QuestionnaireAnswer.deleteMany();
        });
      axios.post(`${questionnaireServerOrigin}/questionnaire-answer/proactive/batch`, { proactiveQuestionnaireAnswers })
        .then(async() => {
          await ProactiveQuestionnaireAnswer.deleteMany();
        });
    };

    const questionnaireOrders: IQuestionnaireOrder[] = await fetchQuestionnaireOrders();

    resendQuestionnaireAnswers();

    // reset QuestionnaireOrder collection and save unfinished ones that exist on questionnaire server
    await QuestionnaireOrder.deleteMany();
    await saveUnfinishedOrders(questionnaireOrders);

    await changeSkippedAnswerStatusToNotAnswered();
  }

  private generateCronJob(cronSchedule: string, maxSecondsUntilRequest: number) {
    return nodeCron.schedule(cronSchedule, async() => {
      // sleep for a random amount to scatter request time from GROWI apps to questionnaire server
      const secToSleep = getRandomIntInRange(0, maxSecondsUntilRequest);
      await this.sleep(secToSleep * 1000);

      try {
        this.executeJob();
      }
      catch (e) {
        logger.error(e);
      }

    });
  }

}

export default QuestionnaireCronService;
