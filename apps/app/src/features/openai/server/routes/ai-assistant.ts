import { type IUserHasId, GroupType } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import { type ValidationChain, body } from 'express-validator';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { type AiAssistant, AiAssistantShareScope, AiAssistantOwnerAccessScope } from '../../interfaces/ai-assistant';
import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:create-ai-assistant');

type CreateAssistantFactory = (crowi: Crowi) => RequestHandler[];

type ReqBody = Omit<AiAssistant, 'vectorStore' | 'owner'>

type Req = Request<undefined, Response, ReqBody> & {
  user: IUserHasId,
}

export const createAiAssistantFactory: CreateAssistantFactory = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);
  const adminRequired = require('~/server/middlewares/admin-required')(crowi);

  const validator: ValidationChain[] = [
    body('name')
      .isString()
      .withMessage('name must be a string')
      .not()
      .isEmpty()
      .withMessage('name is required')
      .escape(),

    body('description')
      .optional()
      .isString()
      .withMessage('description must be a string')
      .escape(),

    body('additionalInstruction')
      .optional()
      .isString()
      .withMessage('additionalInstruction must be a string')
      .escape(),

    body('pagePathPatterns')
      .isArray()
      .withMessage('pagePathPatterns must be an array of strings')
      .not()
      .isEmpty()
      .withMessage('pagePathPatterns must not be empty'),

    body('pagePathPatterns.*') // each item of pagePathPatterns
      .isString()
      .withMessage('pagePathPatterns must be an array of strings')
      .notEmpty()
      .withMessage('pagePathPatterns must not be empty'),

    body('grantedUsers')
      .optional()
      .isArray()
      .withMessage('grantedUsers must be an array'),

    body('grantedUsers.*') // each item of grantedUsers
      .isMongoId()
      .withMessage('grantedUsers must be an array mongoId'),

    body('grantedGroups')
      .optional()
      .isArray()
      .withMessage('Granted groups must be an array'),

    body('grantedGroups.*.type') // each item of grantedGroups
      .isIn(Object.values(GroupType))
      .withMessage('Invalid grantedGroups type value'),

    body('grantedGroups.*.item') // each item of grantedGroups
      .isMongoId()
      .withMessage('Invalid grantedGroups item value'),

    body('shareScope')
      .isIn(Object.values(AiAssistantShareScope))
      .withMessage('Invalid shareScope value'),

    body('ownerAccessScope')
      .isIn(Object.values(AiAssistantOwnerAccessScope))
      .withMessage('Invalid ownerAccessScope value'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, adminRequired, certifyAiService, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {
      try {
        const aiAssistantData = { ...req.body, owner: req.user._id };
        const openaiService = getOpenaiService();
        const aiAssistant = await openaiService?.createAiAssistant(aiAssistantData);

        return res.apiv3({ aiAssistant });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('AiAssistant creation failed'));
      }
    },
  ];
};
