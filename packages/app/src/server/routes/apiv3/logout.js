import { SupportedAction } from '~/interfaces/activity';
import { generateAddActivityMiddleware } from '~/server/middlewares/add-activity';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:routes:apiv3:logout'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

module.exports = (crowi) => {
  const activityEvent = crowi.event('activity');
  const addActivity = generateAddActivityMiddleware(crowi);

  router.post('/', addActivity, async(req, res) => {
    req.session.destroy();

    const activityId = res.locals.activity._id;
    const parameters = { action: SupportedAction.ACTION_USER_LOGOUT };
    activityEvent.emit('update', activityId, parameters);

    return res.send();
  });

  return router;
};
