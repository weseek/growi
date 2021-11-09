import express from 'express';
import { body } from 'express-validator';
import { AllSidebarContentsType } from '~/interfaces/ui';

import loggerFactory from '~/utils/logger';

import UserUISettings from '../../models/user-ui-settings';
import ErrorV3 from '../../models/vo/error-apiv3';

const logger = loggerFactory('growi:routes:apiv3:user-ui-settings');

const router = express.Router();

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const validatorForPut = [
    body('settings').exists().withMessage('The body param \'settings\' is required'),
    body('settings.isSidebarCollapsed').optional().isBoolean(),
    body('settings.currentSidebarContents').optional().isIn(AllSidebarContentsType),
    body('settings.currentProductNavWidth').optional().isNumeric(),
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router.get('/', loginRequiredStrictly, async(req: any, res: any) => {
    const { user } = req;

    try {
      const updatedSettings = await UserUISettings.findOneAndUpdate(
        { user: user._id },
        { user: user._id },
        { upsert: true, new: true },
      );
      return res.apiv3(updatedSettings);
    }
    catch (err) {
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(err));
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router.put('/', loginRequiredStrictly, csrf, validatorForPut, apiV3FormValidator, async(req: any, res: any) => {
    const { user } = req;
    const { settings } = req.body;

    // extract only necessary params
    const updateData = {
      isSidebarCollapsed: settings.isSidebarCollapsed,
      currentSidebarContents: settings.currentSidebarContents,
      currentProductNavWidth: settings.currentProductNavWidth,
    };
    // remove the keys that have null value
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] == null) {
        delete updateData[key];
      }
    });

    try {
      const updatedSettings = await UserUISettings.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            user: user._id,
            ...updateData,
          },
        },
        { upsert: true, new: true },
      );
      return res.apiv3(updatedSettings);
    }
    catch (err) {
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(err));
    }
  });

  return router;
};
