import { Router, Request } from 'express';
import { body, validationResult } from 'express-validator';

import Crowi from '~/server/crowi';
import { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import { configManager } from '~/server/service/config-manager';
import LdapUserGroupSyncService from '~/server/service/external-group/ldap-user-group-sync-service';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:external-user-group');

const router = Router();

interface AuthorizedRequest extends Request {
  user?: any
}

module.exports = (crowi: Crowi): Router => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);

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
  };

  router.get('/ldap/sync-settings', loginRequiredStrictly, adminRequired, validators.ldapSyncSettings, (req: AuthorizedRequest, res: ApiV3Response) => {
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

  router.put('/ldap/sync-settings', loginRequiredStrictly, adminRequired, validators.ldapSyncSettings, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'invalid body params' });
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

  router.put('/ldap/sync', loginRequiredStrictly, adminRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    try {
      const ldapUserGroupSyncService = new LdapUserGroupSyncService(crowi, req.user.name, req.body.password);
      await ldapUserGroupSyncService.syncExternalUserGroups();
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err.message, 500);
    }

    return res.apiv3({}, 204);
  });

  return router;

};
