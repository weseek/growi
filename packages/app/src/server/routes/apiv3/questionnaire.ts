import express, { Request } from 'express';

import { StatusType } from '~/interfaces/questionnaire/questionnaire-answer-status';
import QuestionnaireAnswerStatus from '~/server/models/questionnaire/questionnaire-answer-status';
import QuestionnaireOrder from '~/server/models/questionnaire/questionnaire-order';
import loggerFactory from '~/utils/logger';

import { ApiV3Response } from './interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:questionnaire');

const router = express.Router();

const changeAnswerStatus = async(user, questionnaireOrderId, status: StatusType): Promise<number> => {
  const result = await QuestionnaireAnswerStatus.updateOne({
    user,
    questionnaireOrderId,
  }, {
    status,
  }, { upsert: true });

  if (result.modifiedCount === 1) {
    return 204;
  }
  if (result.upsertedCount === 1) {
    return 201;
  }
  return 404;
};

module.exports = () => {

  router.get('/questionnaire-orders', async(req: Request, res: ApiV3Response) => {
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

  router.put('/answer', async(req: Request, res: ApiV3Response) => {
    try {
      const status = await changeAnswerStatus(req.body.user, req.body.questionnaireOrderId, StatusType.answered);
      return res.apiv3({}, status);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  router.put('/skip', async(req: Request, res: ApiV3Response) => {
    try {
      const status = await changeAnswerStatus(req.body.user, req.body.questionnaireOrderId, StatusType.skipped);
      return res.apiv3({}, status);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;

};
