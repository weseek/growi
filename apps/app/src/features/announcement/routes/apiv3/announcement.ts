import type { Router } from 'express';
import { body } from 'express-validator';

import { SupportedTargetModel, SupportedAction } from '~/interfaces/activity';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type Crowi from '~/server/crowi';

import type { ParamsForAnnouncement } from '../../interfaces/announcement';
import AnnouncementService from '../../server/service/announcement';


const express = require('express');

const router = express.Router();

module.exports = (crowi: Crowi): Router => {

  const { Page } = crowi.models;

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

  router.post('/do-announcement', loginRequiredStrictly, validators.doAnnouncement, async(req: CrowiRequest) => {

    const params: ParamsForAnnouncement = req.body;

    const pageId = params.pageId;

    const page = await Page.findById(pageId);

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

    const activity = await crowi.activityService.createActivity(parametersForActivity);

    AnnouncementService.doAnnounce(activity, page, params);

  });

  return router;

};
