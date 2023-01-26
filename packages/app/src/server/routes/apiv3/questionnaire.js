import { Router } from 'express';

import { StatusType } from '~/interfaces/questionnaire/questionnaire-answer-status';
import QuestionnaireAnswerStatus from '~/server/models/questionnaire/questionnaire-answer-status';
import QuestionnaireOrder from '~/server/models/questionnaire/questionnaire-order';
import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:routes:apiv3:questionnaire');

const router = Router();

module.exports = (crowi) => {
  const loginRequired = require('../../middlewares/login-required')(crowi, true);

  const User = crowi.model('User');

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
    const sendQuestionnaireAnswer = async(user, answers) => {
      const growiQuestionnaireServerOrigin = crowi.configManager?.getConfig('crowi', 'app:growiQuestionnaireServerOrigin');
      const growiInfo = await crowi.questionnaireInfoService.getGrowiInfo();
      const userInfo = crowi.questionnaireInfoService.getUserInfo(user, growiInfo.appSiteUrlHashed);

      const questionnaireAnswer = {
        growiInfo,
        userInfo,
        answers,
        answeredAt: new Date(),
      };

      await axios.post(`${growiQuestionnaireServerOrigin}/questionnaire-answer`, questionnaireAnswer);
    };

    try {
      await sendQuestionnaireAnswer(req.user, req.body.answers);
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
