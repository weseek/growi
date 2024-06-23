import type { Router, Request } from 'express';

// import express from 'express';
import { SupportedTargetModel, SupportedAction } from '~/interfaces/activity';
import type Crowi from '~/server/crowi';

const express = require('express');

const router = express.Router();

module.exports = (crowi: Crowi): Router => {

  const { Page } = crowi.models;

  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  router.post('/', loginRequiredStrictly, async(req: Request) => {

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

    const activity = crowi.activityService.createActivity(parametersForActivity);

    crowi.announcementService.createAnnouncement(activity, page, receivers, announcement);

  });

  return router;

};
