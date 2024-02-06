import type {
  IGrantedGroup,
  IPage, IUser, IUserHasId, PageGrant,
} from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import { isCreatablePage, isUserPage } from '@growi/core/dist/utils/page-path-utils';
import { addHeadingSlash, attachTitleHeader } from '@growi/core/dist/utils/path-utils';
import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { SupportedAction, SupportedTargetModel } from '~/interfaces/activity';
import { subscribeRuleNames } from '~/interfaces/in-app-notification';
import type Crowi from '~/server/crowi';
import { generateAddActivityMiddleware } from '~/server/middlewares/add-activity';
import {
  GlobalNotificationSettingEvent, serializePageSecurely, serializeRevisionSecurely,
} from '~/server/models';
import type { IOptionsForCreate } from '~/server/models/interfaces/page-operation';
import type { PageDocument, PageModel } from '~/server/models/page';
import PageTagRelation from '~/server/models/page-tag-relation';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import { excludeReadOnlyUser } from '../../../middlewares/exclude-read-only-user';
import type { ApiV3Response } from '../interfaces/apiv3-response';


const logger = loggerFactory('growi:routes:apiv3:page:create-page');


async function generateUniquePath(basePath: string, index = 1): Promise<string> {
  const Page = mongoose.model<IPage>('Page');

  const path = basePath + index;
  const existingPageId = await Page.exists({ path, isEmpty: false });
  if (existingPageId != null) {
    return generateUniquePath(basePath, index + 1);
  }
  return path;
}

type ReqBody = {
  path: string,

  grant?: PageGrant,
  grantUserGroupIds?: IGrantedGroup[],

  body?: string,
  overwriteScopesOfDescendants?: boolean,
  isSlackEnabled?: boolean,
  slackChannels?: any,
  pageTags?: string[],
  shouldGeneratePath?: boolean,
}

interface CreatePageRequest extends Request<undefined, ApiV3Response, ReqBody> {
  user: IUserHasId,
}

type CreatePageHandlersFactory = (crowi: Crowi) => RequestHandler[];

export const createPageHandlersFactory: CreatePageHandlersFactory = (crowi) => {
  const Page = mongoose.model<IPage, PageModel>('Page');
  const User = mongoose.model<IUser, { isExistUserByUserPagePath: any }>('User');

  const accessTokenParser = require('../../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);

  const activityEvent = crowi.event('activity');
  const addActivity = generateAddActivityMiddleware(crowi);

  const globalNotificationService = crowi.getGlobalNotificationService();
  const userNotificationService = crowi.getUserNotificationService();


  async function saveTagsAction({ createdPage, pageTags }: { createdPage: PageDocument, pageTags?: string[] }) {
    if (pageTags == null) {
      return [];
    }

    const tagEvent = crowi.event('tag');
    await PageTagRelation.updatePageTags(createdPage.id, pageTags);
    tagEvent.emit('update', createdPage, pageTags);
    return PageTagRelation.listTagNamesByPage(createdPage.id);
  }

  const validator: ValidationChain[] = [
    body('body').optional().isString()
      .withMessage('body must be string or undefined'),
    body('path').exists().not().isEmpty({ ignore_whitespace: true })
      .withMessage('path is required'),
    body('grant').optional().isInt({ min: 0, max: 5 }).withMessage('grant must be integer from 1 to 5'),
    body('overwriteScopesOfDescendants').optional().isBoolean().withMessage('overwriteScopesOfDescendants must be boolean'),
    body('isSlackEnabled').optional().isBoolean().withMessage('isSlackEnabled must be boolean'),
    body('slackChannels').optional().isString().withMessage('slackChannels must be string'),
    body('pageTags').optional().isArray().withMessage('pageTags must be array'),
    body('shouldGeneratePath').optional().isBoolean().withMessage('shouldGeneratePath is must be boolean or undefined'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, excludeReadOnlyUser, addActivity,
    validator, apiV3FormValidator,
    async(req: CreatePageRequest, res: ApiV3Response) => {
      const {
        body, overwriteScopesOfDescendants, isSlackEnabled, slackChannels, pageTags, shouldGeneratePath,
      } = req.body;

      let { path, grant, grantUserGroupIds } = req.body;

      // check whether path starts slash
      path = addHeadingSlash(path);

      if (shouldGeneratePath) {
        try {
          const rootPath = '/';
          const defaultTitle = '/Untitled';
          const basePath = path === rootPath ? defaultTitle : path + defaultTitle;
          path = await generateUniquePath(basePath);

          // if the generated path is not creatable, create the path under the root path
          if (!isCreatablePage(path)) {
            path = await generateUniquePath(defaultTitle);
            // initialize grant data
            grant = 1;
            grantUserGroupIds = undefined;
          }
        }
        catch (err) {
          return res.apiv3Err(new ErrorV3('Failed to generate unique path'));
        }
      }

      if (!isCreatablePage(path)) {
        return res.apiv3Err(`Could not use the path '${path}'`);
      }

      if (isUserPage(path)) {
        const isExistUser = await User.isExistUserByUserPagePath(path);
        if (!isExistUser) {
          return res.apiv3Err("Unable to create a page under a non-existent user's user page");
        }
      }

      const options: IOptionsForCreate = { overwriteScopesOfDescendants };
      if (grant != null) {
        options.grant = grant;
        options.grantUserGroupIds = grantUserGroupIds;
      }

      const isNoBodyPage = body === undefined;
      let initialTags: string[] = [];
      let initialBody = '';
      if (isNoBodyPage) {
        const isEnabledAttachTitleHeader = await configManager.getConfig('crowi', 'customize:isEnabledAttachTitleHeader');
        if (isEnabledAttachTitleHeader) {
          initialBody += `${attachTitleHeader(path)}\n`;
        }

        const templateData = await Page.findTemplate(path);
        if (templateData.templateTags != null) {
          initialTags = templateData.templateTags;
        }
        if (templateData.templateBody != null) {
          initialBody += `${templateData.templateBody}\n`;
        }
      }

      let createdPage;
      try {
        createdPage = await crowi.pageService.create(
          path,
          body ?? initialBody,
          req.user,
          options,
        );
      }
      catch (err) {
        logger.error('Error occurred while creating a page.', err);
        return res.apiv3Err(err);
      }

      const savedTags = await saveTagsAction({ createdPage, pageTags: isNoBodyPage ? initialTags : pageTags });

      const result = {
        page: serializePageSecurely(createdPage),
        tags: savedTags,
        revision: serializeRevisionSecurely(createdPage.revision),
      };

      const parameters = {
        targetModel: SupportedTargetModel.MODEL_PAGE,
        target: createdPage,
        action: SupportedAction.ACTION_PAGE_CREATE,
      };
      activityEvent.emit('update', res.locals.activity._id, parameters);

      res.apiv3(result, 201);

      try {
      // global notification
        await globalNotificationService.fire(GlobalNotificationSettingEvent.PAGE_CREATE, createdPage, req.user);
      }
      catch (err) {
        logger.error('Create grobal notification failed', err);
      }

      // user notification
      if (isSlackEnabled) {
        try {
          const results = await userNotificationService.fire(createdPage, req.user, slackChannels, 'create');
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

      // create subscription
      try {
        await crowi.inAppNotificationService.createSubscription(req.user._id, createdPage._id, subscribeRuleNames.PAGE_CREATE);
      }
      catch (err) {
        logger.error('Failed to create subscription document', err);
      }
    },
  ];
};
