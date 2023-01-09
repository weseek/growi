import express, { Request } from 'express';

import QuestionnaireOrder from '~/server/models/questionnaire/questionnaire-order';
import loggerFactory from '~/utils/logger';

import { ApiV3Response } from './interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:questionnaire');

const router = express.Router();

module.exports = () => {

  router.get('/', async(req: Request, res: ApiV3Response) => {
    const currentDate = new Date();
    try {
      const questionnaireOrders = await QuestionnaireOrder.find({
        showUntil: {
          $gte: currentDate,
        },
      });

      return res.apiv3({ questionnaireOrders });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;

};
