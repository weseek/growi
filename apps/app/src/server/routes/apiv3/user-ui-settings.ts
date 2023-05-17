import { ErrorV3 } from '@growi/core';
import express from 'express';
import { body } from 'express-validator';

import { AllSidebarContentsType } from '~/interfaces/ui';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';
import UserUISettings from '../../models/user-ui-settings';

const logger = loggerFactory('growi:routes:apiv3:user-ui-settings');

const router = express.Router();

module.exports = (crowi) => {

  const validatorForPut = [
    body('settings').exists().withMessage('The body param \'settings\' is required'),
    body('settings.isSidebarCollapsed').optional().isBoolean(),
    body('settings.currentSidebarContents').optional().isIn(AllSidebarContentsType),
    body('settings.currentProductNavWidth').optional().isNumeric(),
    body('settings.preferDrawerModeByUser').optional().isBoolean(),
    body('settings.preferDrawerModeOnEditByUser').optional().isBoolean(),
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router.put('/', validatorForPut, apiV3FormValidator, async(req: any, res: any) => {
    const { user } = req;
    const { settings } = req.body;

    // extract only necessary params
    const updateData = {
      isSidebarCollapsed: settings.isSidebarCollapsed,
      currentSidebarContents: settings.currentSidebarContents,
      currentProductNavWidth: settings.currentProductNavWidth,
      preferDrawerModeByUser: settings.preferDrawerModeByUser,
      preferDrawerModeOnEditByUser: settings.preferDrawerModeOnEditByUser,
    };

    if (user == null) {
      if (req.session.uiSettings == null) {
        req.session.uiSettings = {};
      }
      Object.keys(updateData).forEach((setting) => {
        if (updateData[setting] != null) {
          req.session.uiSettings[setting] = updateData[setting];
        }
      });
      return res.apiv3(updateData);
    }


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
