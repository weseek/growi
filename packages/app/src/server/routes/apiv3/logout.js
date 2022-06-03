import { SUPPORTED_ACTION_TYPE } from '~/interfaces/activity';
import { generateAddActivityMiddleware } from '~/server/middlewares/add-activity';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:routes:apiv3:logout'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

module.exports = (crowi) => {
  const activityService = crowi.activityService;
  const addActivity = generateAddActivityMiddleware(crowi);

  router.post('/', addActivity, async(req, res) => {
    req.session.destroy();

    // return response first
    res.send();

    try {
      const activityId = res.locals.activity._id;
      const parameters = { action: SUPPORTED_ACTION_TYPE.ACTION_LOGOUT };
      await activityService.updateByParameters(activityId, parameters);
    }
    catch (err) {
      logger.error('Update activity failed', err);
    }
  });

  return router;
};
