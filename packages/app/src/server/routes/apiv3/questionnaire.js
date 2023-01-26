import * as os from 'node:os';

import { Router } from 'express';

import { StatusType } from '~/interfaces/questionnaire/questionnaire-answer-status';
import { UserType } from '~/interfaces/questionnaire/user-info';
import QuestionnaireAnswerStatus from '~/server/models/questionnaire/questionnaire-answer-status';
import QuestionnaireOrder from '~/server/models/questionnaire/questionnaire-order';
import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:routes:apiv3:questionnaire');

const router = Router();

module.exports = (crowi) => {
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

  const sendQuestionnaireAnswer = async(user, answers) => {
    const growiQuestionnaireServerOrigin = crowi.configManager?.getConfig('crowi', 'app:growiQuestionnaireServerOrigin');

    const growiInfo = {
      version: crowi.version,
      osInfo: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        totalmem: os.totalmem(),
      },
      appSiteUrlHashed: 'c83e8d2a1aa87b2a3f90561be372ca523bb931e2d00013c1d204879621a25b90',
      type: 'cloud',
      currentUsersCount: 100,
      currentActiveUsersCount: 50,
      wikiType: 'open',
      attachmentType: 'aws',
      activeExternalAccountTypes: 'sample account type',
      deploymentType: 'official-helm-chart',
    };

    const userInfo = user ? {
      userIdHash: '542bcc3bc5bc61b840017a18',
      type: user.admin ? UserType.admin : UserType.general,
      userCreatedAt: user.createdAt,
    } : { type: UserType.guest };

    const questionnaireAnswer = {
      growiInfo,
      userInfo,
      answers,
      answeredAt: new Date(),
    };

    axios.post(`${growiQuestionnaireServerOrigin}/questionnaire-answer`, questionnaireAnswer);
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
