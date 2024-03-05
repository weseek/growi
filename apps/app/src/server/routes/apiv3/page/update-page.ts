import { allOrigin } from '@growi/core';
import type {
  IPage, IRevisionHasId, IUserHasId,
} from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { SupportedAction, SupportedTargetModel } from '~/interfaces/activity';
import { type IApiv3PageUpdateParams } from '~/interfaces/apiv3';
import type { IOptionsForUpdate } from '~/interfaces/page';
import { RehypeSanitizeOption } from '~/interfaces/rehype';
import type Crowi from '~/server/crowi';
import { generateAddActivityMiddleware } from '~/server/middlewares/add-activity';
import {
  GlobalNotificationSettingEvent, serializePageSecurely, serializeRevisionSecurely, serializeUserSecurely,
} from '~/server/models';
import type { PageDocument, PageModel } from '~/server/models/page';
import { configManager } from '~/server/service/config-manager';
import { preNotifyService } from '~/server/service/pre-notify';
import Xss from '~/services/xss';
import XssOption from '~/services/xss/xssOption';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import { excludeReadOnlyUser } from '../../../middlewares/exclude-read-only-user';
import type { ApiV3Response } from '../interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:page:update-page');


type ReqBody = IApiv3PageUpdateParams;

interface UpdatePageRequest extends Request<undefined, ApiV3Response, ReqBody> {
  user: IUserHasId,
}

type UpdatePageHandlersFactory = (crowi: Crowi) => RequestHandler[];

export const updatePageHandlersFactory: UpdatePageHandlersFactory = (crowi) => {
  const Page = mongoose.model<IPage, PageModel>('Page');
  const Revision = mongoose.model<IRevisionHasId>('Revision');

  const accessTokenParser = require('../../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);


  const xss = (() => {
    const initializedConfig = {
      isEnabledXssPrevention: configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention'),
      tagWhitelist: crowi.xssService.getTagWhitelist(),
      attrWhitelist: crowi.xssService.getAttrWhitelist(),
      // TODO: Omit rehype related property from XssOptionConfig type
      //  Server side xss implementation does not require it.
      xssOption: RehypeSanitizeOption.CUSTOM,
    };
    const xssOption = new XssOption(initializedConfig);
    return new Xss(xssOption);
  })();

  // define validators for req.body
  const validator: ValidationChain[] = [
    body('pageId').exists().not().isEmpty({ ignore_whitespace: true })
      .withMessage("'pageId' must be specified"),
    body('revisionId').optional().exists().not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage("'revisionId' must be specified"),
    body('body').exists().isString()
      .withMessage("The empty value is not allowd for the 'body'"),
    body('grant').optional().isInt({ min: 0, max: 5 }).withMessage('grant must be integer from 1 to 5'),
    body('userRelatedGrantUserGroupIds').optional().isArray().withMessage('userRelatedGrantUserGroupIds must be an array of group id'),
    body('overwriteScopesOfDescendants').optional().isBoolean().withMessage('overwriteScopesOfDescendants must be boolean'),
    body('isSlackEnabled').optional().isBoolean().withMessage('isSlackEnabled must be boolean'),
    body('slackChannels').optional().isString().withMessage('slackChannels must be string'),
    body('origin').optional().isIn(allOrigin).withMessage('origin must be "view" or "editor"'),
  ];


  async function postAction(req: UpdatePageRequest, res: ApiV3Response, updatedPage: PageDocument) {
    // persist activity
    const parameters = {
      targetModel: SupportedTargetModel.MODEL_PAGE,
      target: updatedPage,
      action: SupportedAction.ACTION_PAGE_UPDATE,
    };
    const activityEvent = crowi.event('activity');
    activityEvent.emit(
      'update', res.locals.activity._id, parameters,
      { path: updatedPage.path, creator: updatedPage.creator._id.toString() },
      preNotifyService.generatePreNotify,
    );

    // global notification
    try {
      await crowi.globalNotificationService.fire(GlobalNotificationSettingEvent.PAGE_EDIT, updatedPage, req.user);
    }
    catch (err) {
      logger.error('Edit notification failed', err);
    }

    // user notification
    const { revisionId, isSlackEnabled, slackChannels } = req.body;
    if (isSlackEnabled) {
      try {
        const option = revisionId != null ? { previousRevision: revisionId } : undefined;
        const results = await crowi.userNotificationService.fire(updatedPage, req.user, slackChannels, 'update', option);
        results.forEach((result) => {
          if (result.status === 'rejected') {
            logger.error('Create user notification failed', result.reason);
          }
        });
      }
      catch (err) {
        logger.error('Create user notification failed', err);
      }
    }
  }

  const addActivity = generateAddActivityMiddleware(crowi);

  return [
    accessTokenParser, loginRequiredStrictly, excludeReadOnlyUser, addActivity,
    validator, apiV3FormValidator,
    async(req: UpdatePageRequest, res: ApiV3Response) => {
      const {
        pageId, revisionId, body, origin,
      } = req.body;

      // check page existence
      const isExist = await Page.count({ _id: pageId }) > 0;
      if (!isExist) {
        return res.apiv3Err(new ErrorV3(`Page('${pageId}' is not found or forbidden`, 'notfound_or_forbidden'), 400);
      }

      // check revision
      const currentPage = await Page.findByIdAndViewer(pageId, req.user);
      if (currentPage != null && !currentPage.isUpdatable(revisionId, origin)) {
        const latestRevision = await Revision.findById(currentPage.revision).populate('author');
        const returnLatestRevision = {
          revisionId: latestRevision?._id.toString(),
          revisionBody: xss.process(latestRevision?.body),
          createdAt: latestRevision?.createdAt,
          user: serializeUserSecurely(latestRevision?.author),
        };
        return res.apiv3Err(new ErrorV3('Posted param "revisionId" is outdated.', 'conflict'), 409, {
          returnLatestRevision,
        });
      }

      let updatedPage;
      try {
        const { grant, userRelatedGrantUserGroupIds, overwriteScopesOfDescendants } = req.body;
        const options: IOptionsForUpdate = { overwriteScopesOfDescendants, origin };
        if (grant != null) {
          options.grant = grant;
          options.userRelatedGrantUserGroupIds = userRelatedGrantUserGroupIds;
        }
        const previousRevision = await Revision.findById(revisionId);
        updatedPage = await crowi.pageService.updatePage(currentPage, body, previousRevision?.body ?? null, req.user, options);
      }
      catch (err) {
        logger.error('Error occurred while updating a page.', err);
        return res.apiv3Err(err);
      }

      const result = {
        page: serializePageSecurely(updatedPage),
        revision: serializeRevisionSecurely(updatedPage.revision),
      };

      res.apiv3(result, 201);

      postAction(req, res, updatedPage);
    },
  ];
};
