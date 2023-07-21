import type { IUserHasId } from '@growi/core/dist/interfaces';
import { Router, Request } from 'express';
import { body, validationResult } from 'express-validator';

import Crowi from '~/server/crowi';
import { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';

import { IAnswer } from '../../../interfaces/answer';
import { IProactiveQuestionnaireAnswer } from '../../../interfaces/proactive-questionnaire-answer';
import { IQuestionnaireAnswer } from '../../../interfaces/questionnaire-answer';
import { StatusType } from '../../../interfaces/questionnaire-answer-status';
import ProactiveQuestionnaireAnswer from '../../models/proactive-questionnaire-answer';
import QuestionnaireAnswer from '../../models/questionnaire-answer';
import QuestionnaireAnswerStatus from '../../models/questionnaire-answer-status';


const logger = loggerFactory('growi:routes:apiv3:questionnaire');

const router = Router();

interface AuthorizedRequest extends Request {
  user?: any
}

module.exports = (crowi: Crowi): Router => {
  const accessTokenParser = require('~/server/middlewares/access-token-parser')(crowi);
  const loginRequired = require('~/server/middlewares/login-required')(crowi, true);

  const validators = {
    proactiveAnswer: [
      body('satisfaction').exists().isNumeric(),
      body('lengthOfExperience').isString(),
      body('position').isString(),
      body('occupation').isString(),
      body('commentText').exists().isString(),
    ],
    answer: [body('questionnaireOrderId').exists().isString(), body('answers').exists().isArray({ min: 1 })],
    skipDeny: [body('questionnaireOrderId').exists().isString()],
  };

  const changeAnswerStatus = async(user, questionnaireOrderId, status) => {
    const result = await QuestionnaireAnswerStatus.updateOne({
      user: { $eq: user },
      questionnaireOrderId: { $eq: questionnaireOrderId },
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
    const userInfo = crowi.questionnaireService!.getUserInfo(req.user ?? null, growiInfo.appSiteUrlHashed);

    try {
      const questionnaireOrders = await crowi.questionnaireService!.getQuestionnaireOrdersToShow(userInfo, growiInfo, req.user?._id ?? null);

      return res.apiv3({ questionnaireOrders });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  router.get('/is-enabled', accessTokenParser, loginRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const isEnabled = crowi.configManager!.getConfig('crowi', 'questionnaire:isQuestionnaireEnabled');
    return res.apiv3({ isEnabled });
  });

  router.post('/proactive/answer', accessTokenParser, loginRequired, validators.proactiveAnswer, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const sendQuestionnaireAnswer = async() => {
      const questionnaireServerOrigin = crowi.configManager?.getConfig('crowi', 'app:questionnaireServerOrigin');
      const growiInfo = await crowi.questionnaireService!.getGrowiInfo();
      const userInfo = crowi.questionnaireService!.getUserInfo(req.user ?? null, growiInfo.appSiteUrlHashed);

      const proactiveQuestionnaireAnswer: IProactiveQuestionnaireAnswer = {
        satisfaction: req.body.satisfaction,
        lengthOfExperience: req.body.lengthOfExperience,
        position: req.body.position,
        occupation: req.body.occupation,
        commentText: req.body.commentText,
        growiInfo,
        userInfo,
        answeredAt: new Date(),
      };

      try {
        await axios.post(`${questionnaireServerOrigin}/questionnaire-answer/proactive`, proactiveQuestionnaireAnswer);
      }
      catch (err) {
        if (err.request != null) {
          // when failed to send, save to resend in cronjob
          await ProactiveQuestionnaireAnswer.create(proactiveQuestionnaireAnswer);
        }
        else {
          throw err;
        }
      }
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await sendQuestionnaireAnswer();
      return res.apiv3({});
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  router.put('/answer', accessTokenParser, loginRequired, validators.answer, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const sendQuestionnaireAnswer = async(user: IUserHasId, answers: IAnswer[]) => {
      const questionnaireServerOrigin = crowi.configManager?.getConfig('crowi', 'app:questionnaireServerOrigin');
      const growiInfo = await crowi.questionnaireService!.getGrowiInfo();
      const userInfo = crowi.questionnaireService!.getUserInfo(user, growiInfo.appSiteUrlHashed);

      const questionnaireAnswer: IQuestionnaireAnswer = {
        growiInfo,
        userInfo,
        answers,
        answeredAt: new Date(),
        questionnaireOrder: req.body.questionnaireOrderId,
      };

      try {
        await axios.post(`${questionnaireServerOrigin}/questionnaire-answer`, questionnaireAnswer);
      }
      catch (err) {
        if (err.request != null) {
          // when failed to send, save to resend in cronjob
          await QuestionnaireAnswer.create(questionnaireAnswer);
        }
        else {
          throw err;
        }
      }
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await sendQuestionnaireAnswer(req.user ?? null, req.body.answers);
      const status = await changeAnswerStatus(req.user, req.body.questionnaireOrderId, StatusType.answered);
      return res.apiv3({}, status);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  router.put('/skip', accessTokenParser, loginRequired, validators.skipDeny, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const status = await changeAnswerStatus(req.user, req.body.questionnaireOrderId, StatusType.skipped);
      return res.apiv3({}, status);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  router.put('/deny', accessTokenParser, loginRequired, validators.skipDeny, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
