import { GroupType } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import { Router, Request } from 'express';
import {
  body, param, query, validationResult,
} from 'express-validator';

import ExternalUserGroup from '~/features/external-user-group/server/models/external-user-group';
import ExternalUserGroupRelation from '~/features/external-user-group/server/models/external-user-group-relation';
import { SupportedAction } from '~/interfaces/activity';
import Crowi from '~/server/crowi';
import { generateAddActivityMiddleware } from '~/server/middlewares/add-activity';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import { serializeUserGroupRelationSecurely } from '~/server/models/serializers/user-group-relation-serializer';
import { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import { configManager } from '~/server/service/config-manager';
import UserGroupService from '~/server/service/user-group';
import loggerFactory from '~/utils/logger';

import { ldapUserGroupSyncService } from '../../service/ldap-user-group-sync';

const logger = loggerFactory('growi:routes:apiv3:external-user-group');

const router = Router();

interface AuthorizedRequest extends Request {
  user?: any
}

module.exports = (crowi: Crowi): Router => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);
  const adminRequired = require('~/server/middlewares/admin-required')(crowi);
  const addActivity = generateAddActivityMiddleware(crowi);

  const activityEvent = crowi.event('activity');

  const validators = {
    ldapSyncSettings: [
      body('ldapGroupSearchBase').optional({ nullable: true }).isString(),
      body('ldapGroupMembershipAttribute').exists({ checkFalsy: true }).isString(),
      body('ldapGroupMembershipAttributeType').exists({ checkFalsy: true }).isString(),
      body('ldapGroupChildGroupAttribute').exists({ checkFalsy: true }).isString(),
      body('autoGenerateUserOnLdapGroupSync').exists().isBoolean(),
      body('preserveDeletedLdapGroups').exists().isBoolean(),
      body('ldapGroupNameAttribute').optional({ nullable: true }).isString(),
      body('ldapGroupDescriptionAttribute').optional({ nullable: true }).isString(),
    ],
    keycloakSyncSettings: [
      body('keycloakHost').exists({ checkFalsy: true }).isString(),
      body('keycloakRealm').exists({ checkFalsy: true }).isString(),
      body('keycloakGroupSyncClientName').exists({ checkFalsy: true }).isString(),
      body('keycloakGroupSyncClientID').exists({ checkFalsy: true }).isString(),
      body('keycloakGroupSyncClientSecret').exists({ checkFalsy: true }).isString(),
      body('autoGenerateUserOnKeycloakGroupSync').exists().isBoolean(),
      body('preserveDeletedKeycloakGroups').exists().isBoolean(),
      body('keycloakGroupDescriptionAttribute').optional({ nullable: true }).isString(),
    ],
    listChildren: [
      query('parentIds').optional().isArray(),
      query('includeGrandChildren').optional().isBoolean(),
    ],
    ancestorGroup: [
      query('groupId').isString(),
    ],
    update: [
      body('description').optional().isString(),
    ],
    delete: [
      param('id').trim().exists({ checkFalsy: true }),
      query('actionName').trim().exists({ checkFalsy: true }),
      query('transferToUserGroupId').trim(),
    ],
    detail: [
      param('id').isString(),
    ],
  };

  router.get('/', loginRequiredStrictly, adminRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const { query } = req;

    try {
      const page = query.page != null ? parseInt(query.page as string) : undefined;
      const limit = query.limit != null ? parseInt(query.limit as string) : undefined;
      const offset = query.offset != null ? parseInt(query.offset as string) : undefined;
      const pagination = query.pagination != null ? query.pagination !== 'false' : undefined;

      const result = await ExternalUserGroup.findWithPagination({
        page, limit, offset, pagination,
      });
      const { docs: userGroups, totalDocs: totalUserGroups, limit: pagingLimit } = result;
      return res.apiv3({ userGroups, totalUserGroups, pagingLimit });
    }
    catch (err) {
      const msg = 'Error occurred in fetching external user group list';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg));
    }
  });

  router.get('/ancestors', loginRequiredStrictly, adminRequired, validators.ancestorGroup, apiV3FormValidator, async(req, res: ApiV3Response) => {
    const { groupId } = req.query;

    try {
      const userGroup = await ExternalUserGroup.findById(groupId);
      const ancestorUserGroups = await ExternalUserGroup.findGroupsWithAncestorsRecursively(userGroup);
      return res.apiv3({ ancestorUserGroups });
    }
    catch (err) {
      const msg = 'Error occurred while searching user groups';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg));
    }
  });

  router.get('/children', loginRequiredStrictly, adminRequired, validators.listChildren, async(req, res) => {
    try {
      const { parentIds, includeGrandChildren = false } = req.query;

      const externalUserGroupsResult = await ExternalUserGroup.findChildrenByParentIds(parentIds, includeGrandChildren);
      return res.apiv3({
        childUserGroups: externalUserGroupsResult.childUserGroups,
        grandChildUserGroups: externalUserGroupsResult.grandChildUserGroups,
      });
    }
    catch (err) {
      const msg = 'Error occurred in fetching child user group list';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg));
    }
  });

  router.get('/:id', loginRequiredStrictly, adminRequired, validators.detail, async(req, res: ApiV3Response) => {
    const { id } = req.params;

    try {
      const userGroup = await ExternalUserGroup.findById(id);
      return res.apiv3({ userGroup });
    }
    catch (err) {
      const msg = 'Error occurred while getting external user group';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg));
    }
  });

  router.delete('/:id', loginRequiredStrictly, adminRequired, validators.delete, apiV3FormValidator, addActivity,
    async(req: AuthorizedRequest, res: ApiV3Response) => {
      const { id: deleteGroupId } = req.params;
      const { actionName, transferToUserGroupId } = req.query;

      const transferGroupInfo = transferToUserGroupId != null ? {
        item: transferToUserGroupId as string,
        type: GroupType.externalUserGroup,
      } : undefined;

      try {
        const userGroups = await (crowi.userGroupService as UserGroupService)
          .removeCompletelyByRootGroupId(deleteGroupId, actionName, req.user, transferGroupInfo, ExternalUserGroup, ExternalUserGroupRelation);

        const parameters = { action: SupportedAction.ACTION_ADMIN_USER_GROUP_DELETE };
        activityEvent.emit('update', res.locals.activity._id, parameters);

        return res.apiv3({ userGroups });
      }
      catch (err) {
        const msg = 'Error occurred while deleting user groups';
        logger.error(msg, err);
        return res.apiv3Err(new ErrorV3(msg));
      }
    });

  router.put('/:id', loginRequiredStrictly, adminRequired, validators.update, apiV3FormValidator, addActivity, async(req, res: ApiV3Response) => {
    const { id } = req.params;
    const {
      description,
    } = req.body;

    try {
      const userGroup = await ExternalUserGroup.findOneAndUpdate({ _id: id }, { description });

      const parameters = { action: SupportedAction.ACTION_ADMIN_USER_GROUP_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);

      return res.apiv3({ userGroup });
    }
    catch (err) {
      const msg = 'Error occurred in updating an external user group';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg));
    }
  });

  router.get('/:id/external-user-group-relations', loginRequiredStrictly, adminRequired, async(req, res: ApiV3Response) => {
    const { id } = req.params;

    try {
      const externalUserGroup = await ExternalUserGroup.findById(id);
      const userGroupRelations = await ExternalUserGroupRelation.find({ relatedGroup: externalUserGroup })
        .populate('relatedUser');
      const serialized = userGroupRelations.map(relation => serializeUserGroupRelationSecurely(relation));
      return res.apiv3({ userGroupRelations: serialized });
    }
    catch (err) {
      const msg = `Error occurred in fetching user group relations for external user group: ${id}`;
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg));
    }
  });

  router.get('/ldap/sync-settings', loginRequiredStrictly, adminRequired, (req: AuthorizedRequest, res: ApiV3Response) => {
    const settings = {
      ldapGroupSearchBase: configManager?.getConfig('crowi', 'external-user-group:ldap:groupSearchBase'),
      ldapGroupMembershipAttribute: configManager?.getConfig('crowi', 'external-user-group:ldap:groupMembershipAttribute'),
      ldapGroupMembershipAttributeType: configManager?.getConfig('crowi', 'external-user-group:ldap:groupMembershipAttributeType'),
      ldapGroupChildGroupAttribute: configManager?.getConfig('crowi', 'external-user-group:ldap:groupChildGroupAttribute'),
      autoGenerateUserOnLdapGroupSync: configManager?.getConfig('crowi', 'external-user-group:ldap:autoGenerateUserOnGroupSync'),
      preserveDeletedLdapGroups: configManager?.getConfig('crowi', 'external-user-group:ldap:preserveDeletedGroups'),
      ldapGroupNameAttribute: configManager?.getConfig('crowi', 'external-user-group:ldap:groupNameAttribute'),
      ldapGroupDescriptionAttribute: configManager?.getConfig('crowi', 'external-user-group:ldap:groupDescriptionAttribute'),
    };

    return res.apiv3(settings);
  });

  router.get('/keycloak/sync-settings', loginRequiredStrictly, adminRequired, (req: AuthorizedRequest, res: ApiV3Response) => {
    const settings = {
      keycloakHost: configManager?.getConfig('crowi', 'external-user-group:keycloak:host'),
      keycloakRealm: configManager?.getConfig('crowi', 'external-user-group:keycloak:realm'),
      keycloakGroupSyncClientName: configManager?.getConfig('crowi', 'external-user-group:keycloak:groupSyncClientName'),
      keycloakGroupSyncClientID: configManager?.getConfig('crowi', 'external-user-group:keycloak:groupSyncClientID'),
      keycloakGroupSyncClientSecret: configManager?.getConfig('crowi', 'external-user-group:keycloak:groupSyncClientSecret'),
      autoGenerateUserOnKeycloakGroupSync: configManager?.getConfig('crowi', 'external-user-group:keycloak:autoGenerateUserOnGroupSync'),
      preserveDeletedKeycloakGroups: configManager?.getConfig('crowi', 'external-user-group:keycloak:preserveDeletedGroups'),
      keycloakGroupDescriptionAttribute: configManager?.getConfig('crowi', 'external-user-group:keycloak:groupDescriptionAttribute'),
    };

    return res.apiv3(settings);
  });

  router.put('/ldap/sync-settings', loginRequiredStrictly, adminRequired, validators.ldapSyncSettings, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.apiv3Err('external_user_group.invalid_sync_settings', 400);
    }

    const params = {
      'external-user-group:ldap:groupSearchBase': req.body.ldapGroupSearchBase,
      'external-user-group:ldap:groupMembershipAttribute': req.body.ldapGroupMembershipAttribute,
      'external-user-group:ldap:groupMembershipAttributeType': req.body.ldapGroupMembershipAttributeType,
      'external-user-group:ldap:groupChildGroupAttribute': req.body.ldapGroupChildGroupAttribute,
      'external-user-group:ldap:autoGenerateUserOnGroupSync': req.body.autoGenerateUserOnLdapGroupSync,
      'external-user-group:ldap:preserveDeletedGroups': req.body.preserveDeletedLdapGroups,
      'external-user-group:ldap:groupNameAttribute': req.body.ldapGroupNameAttribute,
      'external-user-group:ldap:groupDescriptionAttribute': req.body.ldapGroupDescriptionAttribute,
    };

    if (params['external-user-group:ldap:groupNameAttribute'] == null || params['external-user-group:ldap:groupNameAttribute'] === '') {
      // default is cn
      params['external-user-group:ldap:groupNameAttribute'] = 'cn';
    }

    try {
      await configManager.updateConfigsInTheSameNamespace('crowi', params, true);
      return res.apiv3({}, 204);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  router.put('/keycloak/sync-settings', loginRequiredStrictly, adminRequired, validators.keycloakSyncSettings,
    async(req: AuthorizedRequest, res: ApiV3Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.apiv3Err('external_user_group.invalid_sync_settings', 400);
      }

      const params = {
        'external-user-group:keycloak:host': req.body.keycloakHost,
        'external-user-group:keycloak:realm': req.body.keycloakRealm,
        'external-user-group:keycloak:groupSyncClientName': req.body.keycloakGroupSyncClientName,
        'external-user-group:keycloak:groupSyncClientID': req.body.keycloakGroupSyncClientID,
        'external-user-group:keycloak:groupSyncClientSecret': req.body.keycloakGroupSyncClientSecret,
        'external-user-group:keycloak:autoGenerateUserOnGroupSync': req.body.autoGenerateUserOnKeycloakGroupSync,
        'external-user-group:keycloak:preserveDeletedGroups': req.body.preserveDeletedKeycloakGroups,
        'external-user-group:keycloak:groupDescriptionAttribute': req.body.keycloakGroupDescriptionAttribute,
      };

      try {
        await configManager.updateConfigsInTheSameNamespace('crowi', params, true);
        return res.apiv3({}, 204);
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err, 500);
      }
    });

  router.put('/ldap/sync', loginRequiredStrictly, adminRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    if (ldapUserGroupSyncService?.isExecutingSync) return res.apiv3Err('external_user_group.sync_being_executed', 409);

    try {
      await ldapUserGroupSyncService?.syncExternalUserGroups({ userBindUsername: req.user.name, userBindPassword: req.body.password });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err.message, 500);
    }

    return res.apiv3({}, 204);
  });

  return router;

};
