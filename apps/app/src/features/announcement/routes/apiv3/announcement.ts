import type { IPage } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Router } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { SupportedTargetModel, SupportedAction } from '~/interfaces/activity';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type Crowi from '~/server/crowi';
import type { PageModel } from '~/server/models/page';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';


import type { ParamsForAnnouncement } from '../../interfaces/announcement';
import { announcementService } from '../../server/service/announcement';


const logger = loggerFactory('growi:routes:apiv3:announcement');
const express = require('express');

const router = express.Router();

module.exports = (crowi: Crowi): Router => {

  const Page = mongoose.model<IPage, PageModel>('Page');

  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validators = {
    doAnnouncement: [
      body('sender')
        .exists({ checkFalsy: true })
        .withMessage('sender is required')
        .isMongoId()
        .withMessage('sender must be mongo id'),
      body('comment')
        .optional({ nullable: true })
        .isString()
        .withMessage('comment must be string'),
      body('emoji')
        .optional({ nullable: true })
        .isString()
        .withMessage('emoji must be string'),
      body('isReadReceiptTrackingEnabled')
        .exists()
        .withMessage('isReadReceiptTrackingEnabled is required')
        .isBoolean()
        .withMessage('isReadReceiptTrackingEnabled must be boolean'),
      body('pageId')
        .exists({ checkFalsy: true })
        .withMessage('pageId is required')
        .isMongoId()
        .withMessage('pageId must be mongo id'),
      body('receivers')
        .exists({ checkFalsy: true })
        .withMessage('receivers is required')
        .isArray()
        .withMessage('receivers must be an array'),
    ],
  };

  router.post('/do-announcement', loginRequiredStrictly, validators.doAnnouncement, async(req: CrowiRequest, res: ApiV3Response) => {

    const params: ParamsForAnnouncement = req.body;

    const pageId = params.pageId;

    const page = await Page.findByIdAndViewer(pageId, req.user);

    if (page == null) {
      return res.apiv3Err(new ErrorV3(`Page('${pageId}' is not found or forbidden`, 'notfound_or_forbidden'), 400);
    }

    const parametersForActivity = {
      ip: req.ip,
      endpoint: req.originalUrl,
      user: req.user?._id,
      target: page,
      targetModel: SupportedTargetModel.MODEL_ANNOUNCEMENT,
      action: SupportedAction.ACTION_USER_ANNOUNCE,
      snapshot: {
        username: req.user?.username,
      },
    };

    try {
      const activity = await crowi.activityService.createActivity(parametersForActivity);

      announcementService?.doAnnounce(activity, page, params);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;

};
