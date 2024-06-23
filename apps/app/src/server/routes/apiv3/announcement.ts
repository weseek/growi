import type { Router, Request } from 'express';

// import express from 'express';
import { SupportedTargetModel, SupportedAction } from '~/interfaces/activity';
import type { ParamsForAnnouncement } from '~/interfaces/announcement';
import type Crowi from '~/server/crowi';

const express = require('express');

const router = express.Router();

module.exports = (crowi: Crowi): Router => {

  const { Page } = crowi.models;

  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  router.post('/', loginRequiredStrictly, async(req: Request) => {

    const params: ParamsForAnnouncement = req.body;

    const page = await Page.findById(params.pageId);

    const parametersForActivity = {
      user: params.sender,
      target: page,
      targetModel: SupportedTargetModel.MODEL_PAGE,
      action: SupportedAction.ACTION_USER_ANNOUNCE,
    };

    const activity = crowi.activityService.createActivity(parametersForActivity);

    crowi.announcementService.doAnnounce(activity, page, params);

  });

  return router;

};
