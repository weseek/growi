import { GroupType, type IUserHasId } from '@growi/core';
import type { Request } from 'express';
import { Router } from 'express';
import { query } from 'express-validator';

import ExternalUserGroupRelation from '~/features/external-user-group/server/models/external-user-group-relation';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { IPageGrantService } from '~/server/service/page-grant';
import loggerFactory from '~/utils/logger';

import UserGroupRelation from '../../models/user-group-relation';

import type { ApiV3Response } from './interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:me');

const router = Router();

interface AuthorizedRequest extends Request {
  user?: IUserHasId
}

const validator = {
  getUserGroups: [
    query('path').isString(),
  ],
  getExternalUserGroups: [
    query('path').isString(),
  ],
};

module.exports = function(crowi) {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  const ApiResponse = require('../../util/apiResponse');

  const pageGrantService = crowi.pageGrantService as IPageGrantService;

  /**
   * retrieve user-group documents
   */
  router.get('/user-groups', accessTokenParser, loginRequiredStrictly, validator.getUserGroups, apiV3FormValidator,
    async(req: AuthorizedRequest, res: ApiV3Response) => {
      const { path } = req.query;

      try {
        const userGroups = await UserGroupRelation.findAllGroupsForUser(req.user);
        const userGroupsWithCanGrantPage = await pageGrantService.getCanGrantPageForUserGroups(userGroups, GroupType.userGroup, path as string);
        return res.json(ApiResponse.success({ userGroups: userGroupsWithCanGrantPage }));
      }
      catch (e) {
        logger.error(e);
        return res.apiv3Err(e, 500);
      }
    });

  /**
   * retrieve external-user-group-relation documents
   */
  router.get('/external-user-groups',
    accessTokenParser, loginRequiredStrictly, validator.getExternalUserGroups, apiV3FormValidator,
    async(req: AuthorizedRequest, res: ApiV3Response) => {
      const { path } = req.query;

      try {
        const userGroups = await ExternalUserGroupRelation.findAllGroupsForUser(req.user);
        const userGroupsWithCanGrantPage = await pageGrantService.getCanGrantPageForUserGroups(userGroups, GroupType.userGroup, path as string);
        return res.json(ApiResponse.success({ userGroups: userGroupsWithCanGrantPage }));
      }
      catch (e) {
        logger.error(e);
        return res.apiv3Err(e, 500);
      }
    });

  return router;
};
