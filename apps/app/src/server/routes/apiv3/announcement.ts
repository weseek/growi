import type { Router } from 'express';


// import express from 'express';
import { SupportedTargetModel, SupportedAction } from '~/interfaces/activity';
import type { ParamsForAnnouncement } from '~/interfaces/announcement';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type Crowi from '~/server/crowi';

const express = require('express');

const router = express.Router();

module.exports = (crowi: Crowi): Router => {

  const { Page } = crowi.models;

  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  router.post('/', loginRequiredStrictly, async(req: CrowiRequest) => {

    const params: ParamsForAnnouncement = req.body;

    const page = await Page.findById(params.pageId);

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
