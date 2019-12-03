/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:security-setting');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');
const ErrorV3 = require('../../models/vo/error-apiv3');

const validator = {
  // TODO correct validator
  generalSetting: [
    body('restrictGuestMode').isString(),
    body('pageCompleteDeletionAuthority').isString(),
    body('hideRestrictedByOwner').isBoolean(),
    body('hideRestrictedByGroup').isBoolean(),
  ],
  localSetting: [
    body('isLocalEnabled').boolean(),
    body('registrationMode').isString(),
    body('registrationWhiteList').isString(),
  ],
};

/**
 * @swagger
 *  tags:
 *    name: SecuritySetting
 */


/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      SecurityParams:
 *        type: object
 *          GeneralSetting:
 *            type:object
 *              GuestModeParams:
 *                type: object
 *                properties:
 *                  restrictGuestMode:
 *                    type: string
 *                    description: type of restrictGuestMode
 *              PageDeletionParams:
 *                type: object
 *                properties:
 *                  pageCompleteDeletionAuthority:
 *                    type: string
 *                    description: type of pageDeletionAuthority
 *              Function:
 *                type: object
 *                properties:
 *                  hideRestrictedByOwner:
 *                    type: boolean
 *                    description: enable hide by owner
 *                  hideRestrictedByGroup:
 *                    type: boolean
 *                    description: enable hide by group
 *          LocalSetting:
 *            type: object
 *              LocalEnabledParams:
 *                type: object
 *                properties:
 *                  isLocalEnabled:
 *                    type: boolean
 *                    description: enable local
 *              ModeParams:
 *                type: object
 *                properties:
 *                  registrationMode:
 *                    type:string
 *                    description: type of registrationMode
 *              WhiteListParams:
 *                type: object
 *                properties:
 *                  registrationWhiteList:
 *                    type:string
 *                    description: type of registrationwhiteList
 */

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { ApiV3FormValidator } = crowi.middlewares;
  /**
   * @swagger
   *
   *    /security-setting/:
   *      get:
   *        tags: [SecuritySetting]
   *        description: Get security paramators
   *        responses:
   *          200:
   *            description: params of security
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    securityParams:
   *                      $ref: '#/components/schemas/SecurityParams'
   */
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {
    const securityParams = {
      localSetting: {
        LocalEnabledParams: {
          isLocalEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-local:isEnabled') || false,
        },
        ModeParams: {
          registrationMode: await crowi.configManager.getConfig('crowi', 'security:registrationMode') || '',
        },
        WhiteListParams: {
          registrationWhiteList: await crowi.configManage.getConfig('crowi', 'security:registrationWhiteList') || '',
        },
      },
    };

    return res.apiv3({ securityParams });
  });

  /**
   * @swagger
   *
   *    /security-setting/general-setting:
   *      put:
   *        tags: [SecuritySetting]
   *        description: Update GeneralSetting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  restrictGuestMode:
   *                    description: type of restrictGuestMode
   *                    type: string
   *                  pageCompleteDeletionAuthority:
   *                    type: string
   *                    description: type of pageDeletionAuthority
   *                  hideRestrictedByOwner:
   *                    type: boolean
   *                    description: enable hide by owner
   *                  hideRestrictedByGroup:
   *                    type: boolean
   *                    description: enable hide by group
   *        responses:
   *          200:
   *            description: Succeeded to update general Setting
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    status:
   *                      $ref: '#/components/schemas/SecurityParams/GeneralSetting'
   */
  router.put('/general-setting', loginRequiredStrictly, adminRequired, csrf, validator.generalSetting, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:restrictGuestMode': req.body.restrictGuestMode,
      'security:pageCompleteDeletionAuthority': req.body.pageCompleteDeletionAuthority,
      'security:list-policy:hideRestrictedByOwner': req.body.hideRestrictedByOwner,
      'security:list-policy:hideRestrictedByGroup': req.body.hideRestrictedByGroup,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const securitySettingParams = {
        restrictGuestMode: await crowi.configManager.getConfig('crowi', 'security:restrictGuestMode'),
        pageCompleteDeletionAuthority: await crowi.configManager.getConfig('crowi', 'security:pageCompleteDeletionAuthority'),
        hideRestrictedByOwner: await crowi.configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByOwner'),
        hideRestrictedByGroup: await crowi.configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByGroup'),
      };
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating security setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-secuirty-setting failed'));
    }
  });

  /**
   * @swagger
   *
   *    /security-setting/local-setting:
   *      put:
   *        tags: [SecuritySetting]
   *        description: Update LocalSetting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  isLocalEnabled:
   *                    description: enable local
   *                    type: string
   *                  registrationMode:
   *                    type: string
   *                    description: type of pageDeletionAuthority
   *                  registrationWhiteList:
   *                    type: string
   *                    description: type of registrationWhiteList
   *        responses:
   *          200:
   *            description: Succeeded to update local Setting
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    status:
   *                      $ref: '#/components/schemas/SecurityParams/LocalSetting'
   */
  router.put('/local-setting', loginRequiredStrictly, adminRequired, csrf, validator.localSetting, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-local:isEnabled': req.body.isLocalEnabled,
      'security:registrationMode': req.body.registrationMode,
      'security:registrationWhiteList': req.body.registrationWhiteList,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const localSecuritySettingParams = {
        isLocalEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-local:isEnabled'),
        registrationMode: await crowi.configManager.getConfig('crowi', 'security:registrationMode'),
        registrationWhiteList: await crowi.configManager.getConfig('crowi', 'security:registrationWhiteList'),
      };
      return res.apiv3({ localSecuritySettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating local security setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-local-secuirty-setting failed'));
    }
  });

  return router;
};
