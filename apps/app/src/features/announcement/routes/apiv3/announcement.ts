import type { Router } from 'express';
import {
  body, param, query, validationResult,
} from 'express-validator';

import { SupportedTargetModel, SupportedAction } from '~/interfaces/activity';
import type { ParamsForAnnouncement } from '~/interfaces/announcement';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type Crowi from '~/server/crowi';


const express = require('express');

const router = express.Router();

module.exports = (crowi: Crowi): Router => {

  const { Page } = crowi.models;

  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validators = {
    doAnnouncement: [
      body('sender').exists({ checkFalsy: true }),
      body('comment').optional({ nullable: true }).isString(),
      body('emoji').optional({ nullable: true }).isString(),
      body('isReadReceiptTrackingEnabled').exists().isBoolean(),
      body('pageId').exists({ checkFalsy: true }),
      body('receivers').exists({ checkFalsy: true }).isArray(),
    ],
  };

  router.post('/:id/doAnnouncement', loginRequiredStrictly, validators.doAnnouncement, async (req: CrowiRequest) => {

    const params: ParamsForAnnouncement = req.body;

    const { id: pageId } = req.params;

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

    crowi.announcementService.doAnnounce(activity, page, params);

  });

  return router;

};
