import { Router, Request } from 'express';
import { body, validationResult } from 'express-validator';

import Crowi from '~/server/crowi';
import { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
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
      body('ldapGroupsDN').exists().isString(),
      body('ldapGroupMembershipAttribute').exists().isString(),
      body('ldapGroupMembershipAttributeType').exists().isString(),
      body('ldapGroupChildGroupAttribute').exists().isString(),
      body('autoGenerateUserOnLDAPGroupSync').exists().isBoolean(),
      body('preserveDeletedLDAPGroups').exists().isBoolean(),
      body('ldapGroupNameAttribute').exists().isString(),
      body('ldapGroupDescriptionAttribute').isString(),
    ],
  };

  router.get('/ldap/sync-settings', loginRequiredStrictly, adminRequired, validators.ldapSyncSettings, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const settings = {
      ldapGroupsDN: await crowi.configManager?.getConfig('crowi', 'external-user-group:ldap:groupsDN'),
      ldapGroupMembershipAttribute: await crowi.configManager?.getConfig('crowi', 'external-user-group:ldap:groupMembershipAttribute'),
      ldapGroupMembershipAttributeType: await crowi.configManager?.getConfig('crowi', 'external-user-group:ldap:groupMembershipAttributeType'),
      ldapGroupChildGroupAttribute: await crowi.configManager?.getConfig('crowi', 'external-user-group:ldap:groupChildGroupAttribute'),
      autoGenerateUserOnLDAPGroupSync: await crowi.configManager?.getConfig('crowi', 'external-user-group:ldap:autoGenerateUserOnGroupSync'),
      preserveDeletedLDAPGroups: await crowi.configManager?.getConfig('crowi', 'external-user-group:ldap:preserveDeletedGroups'),
      ldapGroupNameAttribute: await crowi.configManager?.getConfig('crowi', 'external-user-group:ldap:groupNameAttribute'),
      ldapGroupDescriptionAttribute: await crowi.configManager?.getConfig('crowi', 'external-user-group:ldap:groupDescriptionAttribute'),
    };

    return res.apiv3(settings);
  });

  router.put('/ldap/sync-settings', loginRequiredStrictly, adminRequired, validators.ldapSyncSettings, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const requestParams = {
      'external-user-group:ldap:groupsDN': req.body.ldapGroupsDN,
      'external-user-group:ldap:groupMembershipAttribute': req.body.ldapGroupMembershipAttribute,
      'external-user-group:ldap:groupMembershipAttributeType': req.body.ldapGroupMembershipAttributeType,
      'external-user-group:ldap:groupChildGroupAttribute': req.body.ldapGroupChildGroupAttribute,
      'external-user-group:ldap:autoGenerateUserOnGroupSync': req.body.autoGenerateUserOnLDAPGroupSync,
      'external-user-group:ldap:preserveDeletedGroups': req.body.preserveDeletedLDAPGroups,
      'external-user-group:ldap:groupNameAttribute': req.body.ldapGroupNameAttribute,
      'external-user-group:ldap:groupDescriptionAttribute': req.body.ldapGroupDescriptionAttribute,
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.apiv3({}, 204);
    }

    try {
      await crowi.configManager?.updateConfigsInTheSameNamespace('crowi', requestParams, true);
      return res.status(204).json();
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;

};
