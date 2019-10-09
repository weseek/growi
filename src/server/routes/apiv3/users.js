const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:user-group');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');
const { isEmail } = require('validator');

const validator = {};

/**
 * @swagger
 *  tags:
 *    name: Users
 */


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

  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/users:
   *      get:
   *        tags: [Users]
   *        description: Get users
   *        responses:
   *          200:
   *            description: users are fetched
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    users:
   *                      type: object
   *                      description: a result of `Users.find`
   */
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const result = await User.findUsersWithPagination({ page });
      const { docs: users, total: totalUsers, limit: pagingLimit } = result;
      return res.apiv3({ users, totalUsers, pagingLimit });
    }
    catch (err) {
      const msg = 'Error occurred in fetching user group list';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-list-fetch-failed'));
    }
  });

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
   *        parameters:
   *          - name: shapedEmailList
   *            in: query
   *            description: Invitation emailList
   *            schema:
   *              type: object
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
   *                      type: object
   *                      description: Users successfully created
   *                    existingEmailList:
   *                      type: object
   *                      description: Users email that already exists
   */
  router.post('/invite', loginRequiredStrictly, adminRequired, csrf, validator.inviteEmail, ApiV3FormValidator, async(req, res) => {
    try {
      const emailList = await User.createUsersByInvitation(req.body.shapedEmailList, req.body.sendEmail);
      return res.apiv3({ emailList });
    }
    catch (err) {
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(err));
    }
  });
  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/users/{id}/giveAdmin:
   *      put:
   *        tags: [Users]
   *        description: Give user admin
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of user for admin
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Give user admin success
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userData:
   *                      type: object
   *                      description: data of admin user
   */
  router.put('/:id/giveAdmin', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const { id } = req.params;

    try {
      const userData = await User.findById(id);
      await userData.makeAdmin();
      return res.apiv3({ userData });
    }
    catch (err) {
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(err));
    }
  });
  // TODO swagger
  router.put('/:id/removeAdmin', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const { id } = req.params;

    try {
      const userData = await User.findById(id);
      await userData.removeFromAdmin();
      return res.apiv3({ userData });
    }
    catch (err) {
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(err));
    }
  });
  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/users/{id}/activate:
   *      put:
   *        tags: [Users]
   *        description: Activate user
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of activate user
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Activationg user success
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userData:
   *                      type: object
   *                      description: data of activate user
   */
  router.put('/:id/activate', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    // check user upper limit
    const isUserCountExceedsUpperLimit = await User.isUserCountExceedsUpperLimit();
    if (isUserCountExceedsUpperLimit) {
      const msg = 'Unable to activate because user has reached limit';
      logger.error('Error', msg);
      return res.apiv3Err(new ErrorV3(msg));
    }

    const { id } = req.params;

    try {
      const userData = await User.findById(id);
      await userData.statusActivate();
      return res.apiv3({ userData });
    }
    catch (err) {
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(err));
    }
  });
  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/users/{id}/deactivate:
   *      put:
   *        tags: [Users]
   *        description: Deactivate user
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of deactivate user
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Deactivationg user success
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userData:
   *                      type: object
   *                      description: data of deactivate user
   */
  router.put('/:id/deactivate', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const { id } = req.params;

    try {
      const userData = await User.findById(id);
      await userData.statusSuspend();
      return res.apiv3({ userData });
    }
    catch (err) {
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(err));
    }
  });
  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/users/{id}/remove:
   *      delete:
   *        tags: [Users]
   *        description: Delete user
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of delete user
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Deleting user success
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userData:
   *                      type: object
   *                      description: data of delete user
   */
  router.delete('/:id/remove', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const { id } = req.params;

    try {
      const userData = await User.findById(id);
      await userData.statusDelete();
      await ExternalAccount.remove({ user: userData });
      await Page.removeByPath(`/user/${userData.username}`);

      return res.apiv3({ userData });
    }
    catch (err) {
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(err));
    }
  });

  return router;
};
