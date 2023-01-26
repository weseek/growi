import { Router } from 'express';

import { StatusType } from '~/interfaces/questionnaire/questionnaire-answer-status';
import QuestionnaireAnswerStatus from '~/server/models/questionnaire/questionnaire-answer-status';
import QuestionnaireOrder from '~/server/models/questionnaire/questionnaire-order';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:questionnaire');

const router = Router();

const changeAnswerStatus = async(user, questionnaireOrderId, status) => {
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

module.exports = (crowi) => {
  const loginRequired = require('../../middlewares/login-required')(crowi, true);

  router.get('/orders', async(req, res) => {
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

  router.put('/answer', loginRequired, async(req, res) => {
    try {
      const status = await changeAnswerStatus(req.user, req.body.questionnaireOrderId, StatusType.answered);
      return res.apiv3({}, status);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  router.put('/skip', loginRequired, async(req, res) => {
    try {
      const status = await changeAnswerStatus(req.user, req.body.questionnaireOrderId, StatusType.skipped);
      return res.apiv3({}, status);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;

};
