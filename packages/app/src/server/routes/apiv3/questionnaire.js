import crypto from 'crypto';
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
    const getUserInfo = (user, appSiteUrlHashed) => {
      if (user) {
        const hasher = crypto.createHmac('sha256', appSiteUrlHashed);
        hasher.update(user._id.toString());

        return {
          userIdHash: hasher.digest('hex'),
          type: user.admin ? UserType.admin : UserType.general,
          userCreatedAt: user.createdAt,
        };
      }

      return { type: UserType.guest };
    };

    const getGrowiInfo = async() => {
      const appSiteUrl = crowi.appService.getSiteUrl();
      const hasher = crypto.createHash('sha256');
      hasher.update(appSiteUrl);
      const appSiteUrlHashed = hasher.digest('hex');

      const currentUsersCount = await User.countDocuments();
      const currentActiveUsersCount = await User.countActiveUsers();
      const attachmentType = crowi.configManager.getConfig('crowi', 'app:fileUploadType');

      return {
        version: crowi.version,
        osInfo: {
          type: os.type(),
          platform: os.platform(),
          arch: os.arch(),
          totalmem: os.totalmem(),
        },
        appSiteUrl,
        appSiteUrlHashed,
        type: 'cloud', // TODO: set actual value
        currentUsersCount,
        currentActiveUsersCount,
        wikiType: 'open', // TODO: set actual value
        attachmentType,
        activeExternalAccountTypes: undefined, // TODO: set actual value
        deploymentType: undefined, // TODO: set actual value
      };
    };

    const sendQuestionnaireAnswer = async(user, answers) => {
      const growiQuestionnaireServerOrigin = crowi.configManager?.getConfig('crowi', 'app:growiQuestionnaireServerOrigin');

      const growiInfo = await getGrowiInfo();

      const userInfo = getUserInfo(user, growiInfo.appSiteUrlHashed);

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
