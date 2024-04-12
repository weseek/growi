import type { Router, Request } from 'express';
import express from 'express';
import { body, query } from 'express-validator';
import type { UpdateQuery } from 'mongoose';
import mongoose from 'mongoose';

import type { IActivity } from '~/interfaces/activity';
import { SupportedTargetModel, SupportedAction } from '~/interfaces/activity';
import type { IAnnouncement } from '~/interfaces/announcement';
import type Crowi from '~/server/crowi';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';

import type { AnnouncementDocument } from '../../../features/announcement/server/models';

module.exports = (crowi: Crowi): Router => {

  const activityEvent = crowi.event('activity');

  const { Page } = crowi.models;

  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const router = express.Router();

  router.post('/', loginRequiredStrictly, async(req: Request, res: ApiV3Response) => {

    const {
      announcement, sender, pageId, receivers,
    } = req.body;

    const page = await Page.findById(pageId);

    const parametersForActivity = {
      user: sender,
      target: page,
      targetModel: SupportedTargetModel.MODEL_PAGE,
      action: SupportedAction.ACTION_USER_ANNOUNCE,
    };

    // const announcement: IAnnouncement = {
    //   sender,
    //   comment,
    //   emoji,
    //   isReadReceiptTrackingEnabled,
    //   pageId,
    //   receivers,
    // };

    const activity = crowi.activityService.createActivity(parametersForActivity);

    crowi.announcementService.createAnnouncement(activity, page, receivers, announcement);

  });

  return router;

};
