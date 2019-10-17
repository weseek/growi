const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:external-account');

const express = require('express');

const router = express.Router();

const { param } = require('express-validator/check');


const validator = {};

/**
 * @swagger
 *  tags:
 *    name: ExtenralAccount
 */


module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { ErrorV3, ExternalAccount } = crowi.models;

  validator.delete = [
    param('id').trim().exists({ checkFalsy: true }),
  ];
  const { ApiV3FormValidator } = crowi.middlewares;

  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/users/external-accounts/{id}/remove:
   *      delete:
   *        tags: [ExternalAccount]
   *        description: Delete ExternalAccount
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of userGroup
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description:  External Account is removed
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    externalAccount:
   *                      type: object
   *                      description: A result of `ExtenralAccount.findByIdAndRemove`
   */
  router.delete('/:id/remove', loginRequiredStrictly, adminRequired, csrf, validator.delete, ApiV3FormValidator, async(req, res) => {
    const { id: deleteExtenralAccountId } = req.params;

    try {
      const externalAccount = await ExternalAccount.findByIdAndRemove(deleteExtenralAccountId);

      return res.apiv3({ externalAccount });
    }
    catch (err) {
      const msg = 'Error occurred in deleting a external account';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'extenral-account-delete-failed'));
    }
  });


};
