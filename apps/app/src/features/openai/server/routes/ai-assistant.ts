import { type IUserHasId, GroupType } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import { isGrobPatternPath, isCreatablePage } from '@growi/core/dist/utils/page-path-utils';
import type { Request, RequestHandler } from 'express';
import { type ValidationChain, body } from 'express-validator';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { type IApiv3AiAssistantCreateParams, AiAssistantShareScope, AiAssistantAccessScope } from '../../interfaces/ai-assistant';
import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:create-ai-assistant');

type CreateAssistantFactory = (crowi: Crowi) => RequestHandler[];

type Req = Request<undefined, Response, IApiv3AiAssistantCreateParams> & {
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
      .withMessage('pagePathPatterns must not be empty')
      .custom((value: string) => {

        // check if the value is a grob pattern path
        if (value.includes('*')) {
          return isGrobPatternPath(value) && isCreatablePage(value.replace('*', ''));
        }

        return isCreatablePage(value);
      }),

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

    body('accessScope')
      .isIn(Object.values(AiAssistantAccessScope))
      .withMessage('Invalid accessScope value'),
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


type GetAiAssistantsFactory = (crowi: Crowi) => RequestHandler[];

type GetAiAssistantsFactoryReq = Request<undefined, Response, undefined> & {
  user: IUserHasId,
}

export const getAiAssistantsFactory: GetAiAssistantsFactory = (crowi) => {

  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService,
    async(req: GetAiAssistantsFactoryReq, res: ApiV3Response) => {
      try {
        const openaiService = getOpenaiService();
        const aiAssistants = await openaiService?.getAiAssistants(req.user);

        return res.apiv3({ aiAssistants });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('Failed to get AiAssistants'));
      }
    },
  ];
};
