import type { IUserHasId } from '@growi/core';
import type { Request } from 'express';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import { configManager } from '~/server/service/config-manager';
import { growiInfoService } from '~/server/service/growi-info';
import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';

import type { IAnswer } from '../../../interfaces/answer';
import type { IProactiveQuestionnaireAnswer } from '../../../interfaces/proactive-questionnaire-answer';
import type { IQuestionnaireAnswer } from '../../../interfaces/questionnaire-answer';
import { StatusType } from '../../../interfaces/questionnaire-answer-status';
import ProactiveQuestionnaireAnswer from '../../models/proactive-questionnaire-answer';
import QuestionnaireAnswer from '../../models/questionnaire-answer';
import QuestionnaireAnswerStatus from '../../models/questionnaire-answer-status';
import { convertToLegacyFormat, getSiteUrlHashed } from '../../util/convert-to-legacy-format';


const logger = loggerFactory('growi:routes:apiv3:questionnaire');

const router = Router();

interface AuthorizedRequest extends Request {
  user?: any
}

module.exports = (crowi: Crowi): Router => {
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

  /**
   * @swagger
   *
   * /questionnaire/orders:
   *   get:
   *     tags: [Questionnaire]
   *     security:
   *       - api_key: []
   *     summary: /questionnaire/orders
   *     description: Get questionnaire orders
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 questionnaireOrders:
   *                   type: array
   *                   items:
   *                     type: object
   */
  router.get('/orders', accessTokenParser, loginRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const growiInfo = await growiInfoService.getGrowiInfo(true);
    const userInfo = crowi.questionnaireService.getUserInfo(req.user ?? null, getSiteUrlHashed(growiInfo.appSiteUrl));

    try {
      const questionnaireOrders = await crowi.questionnaireService!.getQuestionnaireOrdersToShow(userInfo, growiInfo, req.user?._id ?? null);

      return res.apiv3({ questionnaireOrders });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  /**
   * @swagger
   *
   * /questionnaire/is-enabled:
   *   get:
   *     tags: [Questionnaire]
   *     security:
   *       - api_key: []
   *     summary: /questionnaire/is-enabled
   *     description: Get questionnaire is enabled
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 isEnabled:
   *                   type: boolean
   */
  router.get('/is-enabled', accessTokenParser, loginRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const isEnabled = configManager.getConfig('questionnaire:isQuestionnaireEnabled');
    return res.apiv3({ isEnabled });
  });

  /**
   * @swagger
   *
   * /questionnaire/proactive/answer:
   *   post:
   *     tags: [Questionnaire]
   *     security:
   *       - api_key: []
   *     summary: /questionnaire/proactive/answer
   *     description: Post proactive questionnaire answer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
  router.post('/proactive/answer', accessTokenParser, loginRequired, validators.proactiveAnswer, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const sendQuestionnaireAnswer = async() => {
      const questionnaireServerOrigin = configManager.getConfig('app:questionnaireServerOrigin');
      const isAppSiteUrlHashed = configManager.getConfig('questionnaire:isAppSiteUrlHashed');
      const growiInfo = await growiInfoService.getGrowiInfo(true);
      const userInfo = crowi.questionnaireService.getUserInfo(req.user ?? null, getSiteUrlHashed(growiInfo.appSiteUrl));

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

      const proactiveQuestionnaireAnswerLegacy = convertToLegacyFormat(proactiveQuestionnaireAnswer, isAppSiteUrlHashed);

      try {
        await axios.post(`${questionnaireServerOrigin}/questionnaire-answer/proactive`, proactiveQuestionnaireAnswerLegacy);
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

  /**
   * @swagger
   *
   * /questionnaire/answer:
   *   put:
   *     tags: [Questionnaire]
   *     security:
   *       - api_key: []
   *     summary: /questionnaire/answer
   *     description: Post questionnaire answer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       201:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       204:
   *         description: No Content
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       404:
   *         description: Not Found
   */
  router.put('/answer', accessTokenParser, loginRequired, validators.answer, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const sendQuestionnaireAnswer = async(user: IUserHasId, answers: IAnswer[]) => {
      const questionnaireServerOrigin = crowi.configManager.getConfig('app:questionnaireServerOrigin');
      const isAppSiteUrlHashed = configManager.getConfig('questionnaire:isAppSiteUrlHashed');
      const growiInfo = await growiInfoService.getGrowiInfo(true);
      const userInfo = crowi.questionnaireService.getUserInfo(user, getSiteUrlHashed(growiInfo.appSiteUrl));

      const questionnaireAnswer: IQuestionnaireAnswer = {
        growiInfo,
        userInfo,
        answers,
        answeredAt: new Date(),
        questionnaireOrder: req.body.questionnaireOrderId,
      };

      const questionnaireAnswerLegacy = convertToLegacyFormat(questionnaireAnswer, isAppSiteUrlHashed);

      try {
        await axios.post(`${questionnaireServerOrigin}/questionnaire-answer`, questionnaireAnswerLegacy);
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

  /**
   * @swagger
   *
   * /questionnaire/skip:
   *   put:
   *     tags: [Questionnaire]
   *     security:
   *       - api_key: []
   *     summary: /questionnaire/skip
   *     description: Skip questionnaire
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       201:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       204:
   *         description: No Content
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       404:
   *         description: Not Found
   */
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

  /**
   * @swagger
   *
   * /questionnaire/deny:
   *   put:
   *     tags: [Questionnaire]
   *     security:
   *       - api_key: []
   *     summary: /questionnaire/deny
   *     description: Deny questionnaire
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       201:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       204:
   *         description: No Content
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       404:
   *         description: Not Found
   */
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
