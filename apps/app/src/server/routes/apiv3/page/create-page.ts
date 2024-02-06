import type {
  IGrantedGroup,
  IPage, IUser, IUserHasId, PageGrant,
} from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import { isCreatablePage, isUserPage } from '@growi/core/dist/utils/page-path-utils';
import { attachTitleHeader, normalizePath } from '@growi/core/dist/utils/path-utils';
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


async function generateUntitledPath(parentPath: string, basePathname: string, index = 1): Promise<string> {
  const Page = mongoose.model<IPage>('Page');

  const path = `${normalizePath(parentPath)}${normalizePath(basePathname)}-${index}`;
  if (await Page.exists({ path, isEmpty: false }) != null) {
    return generateUntitledPath(parentPath, basePathname, index + 1);
  }
  return path;
}

async function determinePath(parentPath?: string, path?: string, optionalParentPath?: string): Promise<string> {
  // TODO: i18n
  const basePathname = 'Untitled';

  if (path != null) {
    // when path is valid
    if (isCreatablePage(path)) {
      return normalizePath(path);
    }
    // when optionalParentPath is set
    if (optionalParentPath != null) {
      return generateUntitledPath(optionalParentPath, basePathname);
    }
    // when path is invalid
    throw new Error('Could not create the page');
  }

  if (parentPath != null) {
    // when parentPath is valid
    if (isCreatablePage(parentPath)) {
      return generateUntitledPath(parentPath, basePathname);
    }
    // when optionalParentPath is set
    if (optionalParentPath != null) {
      return generateUntitledPath(optionalParentPath, basePathname);
    }
    // when parentPath is invalid
    throw new Error('Could not create the page');
  }

  // when both path and parentPath are not specified
  return generateUntitledPath('/', basePathname);
}


type ReqBody = {
  path?: string,
  parentPath?: string,
  optionalParentPath?: string,

  body?: string,
  pageTags?: string[],

  grant?: PageGrant,
  grantUserGroupIds?: IGrantedGroup[],
  overwriteScopesOfDescendants?: boolean,

  isSlackEnabled?: boolean,
  slackChannels?: any,
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


  // define validators for req.body
  const validator: ValidationChain[] = [
    body('path').optional().not().isEmpty({ ignore_whitespace: true })
      .withMessage("The empty value is not allowd for the 'path'"),
    body('parentPath').optional().not().isEmpty({ ignore_whitespace: true })
      .withMessage("The empty value is not allowd for the 'parentPath'"),
    body('optionalParentPath').optional().not().isEmpty({ ignore_whitespace: true })
      .withMessage("The empty value is not allowd for the 'optionalParentPath'"),
    body('body').optional().isString()
      .withMessage('body must be string or undefined'),
    body('grant').optional().isInt({ min: 0, max: 5 }).withMessage('grant must be integer from 1 to 5'),
    body('overwriteScopesOfDescendants').optional().isBoolean().withMessage('overwriteScopesOfDescendants must be boolean'),
    body('pageTags').optional().isArray().withMessage('pageTags must be array'),
    body('isSlackEnabled').optional().isBoolean().withMessage('isSlackEnabled must be boolean'),
    body('slackChannels').optional().isString().withMessage('slackChannels must be string'),
    // body('shouldGeneratePath').optional().isBoolean().withMessage('shouldGeneratePath is must be boolean or undefined'),
  ];


  async function saveTags({ createdPage, pageTags }: { createdPage: PageDocument, pageTags: string[] }) {
    const tagEvent = crowi.event('tag');
    await PageTagRelation.updatePageTags(createdPage.id, pageTags);
    tagEvent.emit('update', createdPage, pageTags);
    return PageTagRelation.listTagNamesByPage(createdPage.id);
  }

  async function postAction(req: CreatePageRequest, res: ApiV3Response, createdPage: PageDocument) {
    // persist activity
    const parameters = {
      targetModel: SupportedTargetModel.MODEL_PAGE,
      target: createdPage,
      action: SupportedAction.ACTION_PAGE_CREATE,
    };
    const activityEvent = crowi.event('activity');
    activityEvent.emit('update', res.locals.activity._id, parameters);

    // global notification
    try {
      await crowi.globalNotificationService.fire(GlobalNotificationSettingEvent.PAGE_CREATE, createdPage, req.user);
    }
    catch (err) {
      logger.error('Create grobal notification failed', err);
    }

    // user notification
    const { isSlackEnabled, slackChannels } = req.body;
    if (isSlackEnabled) {
      try {
        const results = await crowi.userNotificationService.fire(createdPage, req.user, slackChannels, 'create');
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
  }

  const addActivity = generateAddActivityMiddleware(crowi);

  return [
    accessTokenParser, loginRequiredStrictly, excludeReadOnlyUser, addActivity,
    validator, apiV3FormValidator,
    async(req: CreatePageRequest, res: ApiV3Response) => {
      const {
        body, pageTags,
      } = req.body;

      let pathToCreate: string;
      try {
        const { path, parentPath, optionalParentPath } = req.body;
        pathToCreate = await determinePath(parentPath, path, optionalParentPath);
      }
      catch (err) {
        return res.apiv3Err(new ErrorV3('Could not create the page.', 'could_not_create_page'));
      }

      if (isUserPage(pathToCreate)) {
        const isExistUser = await User.isExistUserByUserPagePath(pathToCreate);
        if (!isExistUser) {
          return res.apiv3Err("Unable to create a page under a non-existent user's user page");
        }
      }

      let initialTags: string[] = pageTags ?? [];
      let initialBody = body ?? '';
      if (body == null) {
        const isEnabledAttachTitleHeader = await configManager.getConfig('crowi', 'customize:isEnabledAttachTitleHeader');
        if (isEnabledAttachTitleHeader) {
          initialBody += `${attachTitleHeader(pathToCreate)}\n`;
        }

        const templateData = await Page.findTemplate(pathToCreate);
        if (templateData.templateTags != null) {
          initialTags = templateData.templateTags;
        }
        if (templateData.templateBody != null) {
          initialBody += `${templateData.templateBody}\n`;
        }
      }

      let createdPage;
      try {
        const { grant, grantUserGroupIds, overwriteScopesOfDescendants } = req.body;
        const options: IOptionsForCreate = { overwriteScopesOfDescendants };
        if (grant != null) {
          options.grant = grant;
          options.grantUserGroupIds = grantUserGroupIds;
        }
        createdPage = await crowi.pageService.create(
          pathToCreate,
          initialBody,
          req.user,
          options,
        );
      }
      catch (err) {
        logger.error('Error occurred while creating a page.', err);
        return res.apiv3Err(err);
      }

      const savedTags = await saveTags({ createdPage, pageTags: initialTags });

      const result = {
        page: serializePageSecurely(createdPage),
        tags: savedTags,
        revision: serializeRevisionSecurely(createdPage.revision),
      };

      res.apiv3(result, 201);

      postAction(req, res, createdPage);
    },
  ];
};
