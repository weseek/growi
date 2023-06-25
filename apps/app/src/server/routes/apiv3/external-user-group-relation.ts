import { ErrorV3 } from '@growi/core';
import { Router, Request } from 'express';

import Crowi from '~/server/crowi';
import ExternalUserGroupRelation from '~/server/models/external-user-group-relation';
import loggerFactory from '~/utils/logger';

import { ApiV3Response } from './interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:user-group-relation'); // eslint-disable-line no-unused-vars

const express = require('express');
const { query } = require('express-validator');

const { serializeUserGroupRelationSecurely } = require('../../models/serializers/user-group-relation-serializer');

const router = express.Router();

module.exports = (crowi: Crowi): Router => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);

  const validators = {
    list: [
      query('groupIds').isArray(),
      query('childGroupIds').optional().isArray(),
    ],
  };

  router.get('/', loginRequiredStrictly, adminRequired, validators.list, async(req: Request, res: ApiV3Response) => {
    const { query } = req;

    try {
      const relations = await ExternalUserGroupRelation.find({ relatedGroup: { $in: query.groupIds } }).populate('relatedUser');

      let relationsOfChildGroups = null;
      if (Array.isArray(query.childGroupIds)) {
        const _relationsOfChildGroups = await ExternalUserGroupRelation.find({ relatedGroup: { $in: query.childGroupIds } }).populate('relatedUser');
        relationsOfChildGroups = _relationsOfChildGroups.map(relation => serializeUserGroupRelationSecurely(relation)); // serialize
      }

      const serialized = relations.map(relation => serializeUserGroupRelationSecurely(relation));

      return res.apiv3({ userGroupRelations: serialized, relationsOfChildGroups });
    }
    catch (err) {
      const msg = 'Error occurred in fetching user group relations';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg));
    }
  });

  return router;
};
