const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:user-group'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');
const { isEmail } = require('validator');

const validator = {};

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const {
    ErrorV3,
    User,
    Page,
    ExternalAccount,
  } = crowi.models;

  const { ApiV3FormValidator } = crowi.middlewares;

  validator.inviteEmail = [
    // isEmail prevents line breaks, so use isString
    body('shapedEmailList').custom((value) => {
      const array = value.filter((value) => { return isEmail(value) });
      if (array.length === 0) {
        throw new Error('At least one valid email address is required');
      }
      return array;
    }),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/users/invite:
   *      post:
   *        tags: [Users]
   *        description: Create new users and send Emails
   *        produces:
   *          - application/json
   *        parameters:
   *          - name: shapedEmailList
   *            in: query
   *            description: Invitation emailList
   *            schema:
   *              type: array
   *          - name: sendEmail
   *            in: query
   *            description: Whether to send mail
   *            schema:
   *              type: boolean
   *        responses:
   *          200:
   *            description: Inviting user success
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    createdUserList:
   *                      type: array
   *                      email:
   *                        type: string
   *                      password:
   *                        type: string
   *                      description: Users successfully created
   *                    existingEmailList:
   *                      type: array
   *                      email:
   *                        type: string
   *                      description: Users email that already exists
   */
  router.post('/invite', loginRequiredStrictly, adminRequired, csrf, validator.inviteEmail, ApiV3FormValidator, async(req, res) => {
    try {
      const emailList = await User.createUsersByInvitation(req.body.shapedEmailList, req.body.sendEmail);
      return res.apiv3({ emailList });
    }
    catch (err) {
      return res.apiv3Err(new ErrorV3(err));
    }
  });

  router.delete('/:id/remove', loginRequired(), adminRequired, csrf, async(req, res) => {
    const { id } = req.params;

    try {
      const userData = await User.findById(id);
      await userData.statusDelete();
      await ExternalAccount.remove({ user: userData });
      await Page.removeByPath(`/user/${userData.username}`);

      return res.apiv3({ userData });
    }
    catch (err) {
      return res.apiv3Err(new ErrorV3(err));
    }
  });

  return router;
};
