import { type IUserHasId, GroupType } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import { isGrobPatternPath, isCreatablePage } from '@growi/core/dist/utils/page-path-utils';
import type { Request, RequestHandler } from 'express';
import { type ValidationChain, param, body } from 'express-validator';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { type AiAssistantUpdateData, AiAssistantShareScope, AiAssistantAccessScope } from '../../interfaces/ai-assistant';
import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:update-ai-assistants');


type UpdateAiAssistantsFactory = (crowi: Crowi) => RequestHandler[];

type ReqParams = {
  id: string,
}

type ReqBody = AiAssistantUpdateData;

type Req = Request<ReqParams, Response, ReqBody> & {
  user: IUserHasId,
}

export const updateAiAssistantsFactory: UpdateAiAssistantsFactory = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    param('id').isMongoId().withMessage('aiAssistant id is required'),
    body('name')
      .optional()
      .isString()
      .withMessage('name must be a string')
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
      .optional()
      .isArray()
      .withMessage('pagePathPatterns must be an array of strings')
      .not()
      .isEmpty()
      .withMessage('pagePathPatterns must not be empty'),

    body('pagePathPatterns.*') // each item of pagePathPatterns
      .isString()
      .withMessage('pagePathPatterns must be an array of strings')
      .not()
      .isEmpty()
      .withMessage('pagePathPatterns must not be empty')
      .custom((value: string) => {

        // check if the value is a grob pattern path
        if (value.includes('*')) {
          return isGrobPatternPath(value) && isCreatablePage(value.replace('*', ''));
        }

        return isCreatablePage(value);
      }),

    body('grantedGroupsForShareScope')
      .optional()
      .isArray()
      .withMessage('grantedGroupsForShareScope must be an array'),

    body('grantedGroupsForShareScope.*.type') // each item of grantedGroupsForShareScope
      .isIn(Object.values(GroupType))
      .withMessage('Invalid grantedGroupsForShareScope type value'),

    body('grantedGroupsForShareScope.*.item') // each item of grantedGroupsForShareScope
      .isMongoId()
      .withMessage('Invalid grantedGroupsForShareScope item value'),

    body('grantedGroupsForAccessScope')
      .optional()
      .isArray()
      .withMessage('grantedGroupsForAccessScope must be an array'),

    body('grantedGroupsForAccessScope.*.type') // each item of grantedGroupsForAccessScope
      .isIn(Object.values(GroupType))
      .withMessage('Invalid grantedGroupsForAccessScope type value'),

    body('grantedGroupsForAccessScope.*.item') // each item of grantedGroupsForAccessScope
      .isMongoId()
      .withMessage('Invalid grantedGroupsForAccessScope item value'),

    body('shareScope')
      .optional()
      .isIn(Object.values(AiAssistantShareScope))
      .withMessage('Invalid shareScope value'),

    body('accessScope')
      .optional()
      .isIn(Object.values(AiAssistantAccessScope))
      .withMessage('Invalid accessScope value'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {
      const { id } = req.params;
      const { user } = req;

      try {
        const openaiService = getOpenaiService();
        const updatedAiAssistant = await openaiService?.updateAiAssistant(user._id, id, req.body);

        return res.apiv3({ updatedAiAssistant });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('Failed to update AiAssistants'));
      }
    },
  ];
};
