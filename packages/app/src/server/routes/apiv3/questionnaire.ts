import { Router, Request } from 'express';

import { StatusType } from '~/interfaces/questionnaire/questionnaire-answer-status';
import Crowi from '~/server/crowi';
import QuestionnaireAnswerStatus from '~/server/models/questionnaire/questionnaire-answer-status';
import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';

import { ApiV3Response } from './interfaces/apiv3-response';


const logger = loggerFactory('growi:routes:apiv3:questionnaire');

const router = Router();

interface AuthorizedRequest extends Request {
  user?: any
}

module.exports = (crowi: Crowi): Router => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);

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

  router.get('/orders', accessTokenParser, loginRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const growiInfo = await crowi.questionnaireService!.getGrowiInfo();
    const userInfo = crowi.questionnaireService!.getUserInfo(req.user, growiInfo.appSiteUrlHashed);

    // TODO: add condition
    try {
      const questionnaireOrders = await crowi.questionnaireService!.getQuestionnaireOrdersToShow(userInfo, growiInfo, req.user?._id ?? null);

      return res.apiv3({ questionnaireOrders });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  router.put('/answer', accessTokenParser, loginRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const sendQuestionnaireAnswer = async(user, answers) => {
      const growiQuestionnaireServerOrigin = crowi.configManager?.getConfig('crowi', 'app:growiQuestionnaireServerOrigin');
      const growiInfo = await crowi.questionnaireService!.getGrowiInfo();
      const userInfo = crowi.questionnaireService!.getUserInfo(user, growiInfo.appSiteUrlHashed);

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

  router.put('/skip', accessTokenParser, loginRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    try {
      const status = await changeAnswerStatus(req.user, req.body.questionnaireOrderId, StatusType.skipped);
      return res.apiv3({}, status);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  router.put('/deny', accessTokenParser, loginRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    try {
      const status = await changeAnswerStatus(req.user, req.body.questionnaireOrderId, StatusType.denied);
      return res.apiv3({}, status);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;

};
