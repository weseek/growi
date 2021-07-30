import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:user-group');

const express = require('express');

const router = express.Router();

const path = require('path');

const { body, query } = require('express-validator');
const { isEmail } = require('validator');
const { serializeUserSecurely } = require('../../models/serializers/user-serializer');

const ErrorV3 = require('../../models/vo/error-apiv3');

const PAGE_ITEMS = 50;

const validator = {};

/**
 * @swagger
 *  tags:
 *    name: Users
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      User:
 *        description: User
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: user ID
 *            example: 5ae5fccfc5577b0004dbd8ab
 *          lang:
 *            type: string
 *            description: language
 *            example: 'en_US'
 *          status:
 *            type: integer
 *            description: status
 *            example: 0
 *          admin:
 *            type: boolean
 *            description: whether the admin
 *            example: false
 *          email:
 *            type: string
 *            description: E-Mail address
 *            example: alice@aaa.aaa
 *          username:
 *            type: string
 *            description: username
 *            example: alice
 *          name:
 *            type: string
 *            description: full name
 *            example: Alice
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const {
    User,
    Page,
    ExternalAccount,
    UserGroupRelation,
  } = crowi.models;


  const statusNo = {
    registered: User.STATUS_REGISTERED,
    active: User.STATUS_ACTIVE,
    suspended: User.STATUS_SUSPENDED,
    invited: User.STATUS_INVITED,
  };

  validator.statusList = [
    query('selectedStatusList').if(value => value != null).custom((value, { req }) => {

      const { user } = req;

      if (user != null && user.admin) {
        return value;
      }
      throw new Error('the param \'selectedStatusList\' is not allowed to use by the users except administrators');
    }),
    // validate sortOrder : asc or desc
    query('sortOrder').isIn(['asc', 'desc']),
    // validate sort : what column you will sort
    query('sort').isIn(['id', 'status', 'username', 'name', 'email', 'createdAt', 'lastLoginAt']),
    query('page').isInt({ min: 1 }),
    query('forceIncludeAttributes').toArray().custom((value, { req }) => {
      // only the admin user can specify forceIncludeAttributes
      if (value.length === 0) {
        return true;
      }
      return req.user.admin;
    }),
  ];

  validator.recentCreatedByUser = [
    query('limit').if(value => value != null).isInt({ max: 300 }).withMessage('You should set less than 300 or not to set limit.'),
  ];

  const sendEmailByUserList = async(userList) => {
    const { appService, mailService } = crowi;
    const appTitle = appService.getAppTitle();
    const failedToSendEmailList = [];

    for (const user of userList) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await mailService.send({
          to: user.email,
          subject: `Invitation to ${appTitle}`,
          template: path.join(crowi.localeDir, 'en_US/admin/userInvitation.txt'),
          vars: {
            email: user.email,
            password: user.password,
            url: crowi.appService.getSiteUrl(),
            appTitle,
          },
        });
        // eslint-disable-next-line no-await-in-loop
        await User.updateIsInvitationEmailSended(user.user.id);
      }
      catch (err) {
        logger.error(err);
        failedToSendEmailList.push({
          email: user.email,
          reason: err.message,
        });
      }
    }

    return { failedToSendEmailList };
  };

  /**
   * @swagger
   *
   *  paths:
   *    /users:
   *      get:
   *        tags: [Users]
   *        operationId: listUsers
   *        summary: /users
   *        description: Select selected columns from users order by asc or desc
   *        parameters:
   *          - name: page
   *            in: query
   *            description: page number
   *            schema:
   *              type: number
   *          - name: selectedStatusList
   *            in: query
   *            description: status list
   *            schema:
   *              type: string
   *          - name: searchText
   *            in: query
   *            description: For incremental search value from input box
   *            schema:
   *              type: string
   *          - name: sortOrder
   *            in: query
   *            description: asc or desc
   *            schema:
   *              type: string
   *          - name: sort
   *            in: query
   *            description: sorting column
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: users are fetched
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    paginateResult:
   *                      $ref: '#/components/schemas/PaginateResult'
   */

  router.get('/', accessTokenParser, loginRequired, validator.statusList, apiV3FormValidator, async(req, res) => {

    const page = parseInt(req.query.page) || 1;
    // status
    const { forceIncludeAttributes } = req.query;
    const selectedStatusList = req.query.selectedStatusList || ['active'];

    const statusNoList = (selectedStatusList.includes('all')) ? Object.values(statusNo) : selectedStatusList.map(element => statusNo[element]);

    // Search from input
    const searchText = req.query.searchText || '';
    const searchWord = new RegExp(`${searchText}`);
    // Sort
    const { sort, sortOrder } = req.query;
    const sortOutput = {
      [sort]: (sortOrder === 'desc') ? -1 : 1,
    };

    //  For more information about the external specification of the User API, see here (https://dev.growi.org/5fd7466a31d89500488248e3)

    const orConditions = [
      { name: { $in: searchWord } },
      { username: { $in: searchWord } },
    ];

    const query = {
      $and: [
        { status: { $in: statusNoList } },
        {
          $or: orConditions,
        },
      ],
    };

    try {
      if (req.user != null) {
        orConditions.push(
          {
            $and: [
              { isEmailPublished: true },
              { email: { $in: searchWord } },
            ],
          },
        );
      }
      if (forceIncludeAttributes.includes('email')) {
        orConditions.push({ email: { $in: searchWord } });
      }

      const paginateResult = await User.paginate(
        query,
        {
          sort: sortOutput,
          page,
          limit: PAGE_ITEMS,
        },
      );

      paginateResult.docs = paginateResult.docs.map((doc) => {

        // return email only when specified by query
        const { email } = doc;
        const user = serializeUserSecurely(doc);
        if (forceIncludeAttributes.includes('email')) {
          user.email = email;
        }

        return user;
      });

      return res.apiv3({ paginateResult });
    }
    catch (err) {
      const msg = 'Error occurred in fetching user group list';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-list-fetch-failed'), 500);
    }
  });

  /**
   * @swagger
   *
   *  paths:
   *    /{id}/recent:
   *      get:
   *        tags: [Users]
   *        operationId: recent created page of user id
   *        summary: /usersIdReacent
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of user
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: users recent created pages are fetched
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    paginateResult:
   *                      $ref: '#/components/schemas/PaginateResult'
   */
  router.get('/:id/recent', accessTokenParser, loginRequired, validator.recentCreatedByUser, apiV3FormValidator, async(req, res) => {
    const { id } = req.params;

    let user;

    try {
      user = await User.findById(id);
    }
    catch (err) {
      const msg = 'Error occurred in find user';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'retrieve-recent-created-pages-failed'), 500);
    }

    if (user == null) {
      return res.apiv3Err(new ErrorV3('find-user-is-not-found'));
    }

    const limit = parseInt(req.query.limit) || await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationM') || 30;
    const page = req.query.page;
    const offset = (page - 1) * limit;
    const queryOptions = { offset, limit };

    try {
      const result = await Page.findListByCreator(user, req.user, queryOptions);

      // Delete unnecessary data about users
      result.pages = result.pages.map((page) => {
        const user = page.lastUpdateUser.toObject();
        page.lastUpdateUser = user;
        return page;
      });

      return res.apiv3(result);
    }
    catch (err) {
      const msg = 'Error occurred in retrieve recent created pages for user';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'retrieve-recent-created-pages-failed'), 500);
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
   *    /users/invite:
   *      post:
   *        tags: [Users]
   *        operationId: inviteUser
   *        summary: /users/invite
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
   *                    failedEmailList:
   *                      type: object
   *                      description: Users email that failed to create or send email
   */
  router.post('/invite', loginRequiredStrictly, adminRequired, csrf, validator.inviteEmail, apiV3FormValidator, async(req, res) => {

    // Delete duplicate email addresses
    const emailList = Array.from(new Set(req.body.shapedEmailList));
    let failedEmailList = [];

    // Create users
    const createUser = await User.createUsersByEmailList(emailList);
    if (createUser.failedToCreateUserEmailList.length > 0) {
      failedEmailList = failedEmailList.concat(createUser.failedToCreateUserEmailList);
    }

    // Send email
    if (req.body.sendEmail) {
      const sendEmail = await sendEmailByUserList(createUser.createdUserList);
      if (sendEmail.failedToSendEmailList.length > 0) {
        failedEmailList = failedEmailList.concat(sendEmail.failedToSendEmailList);
      }
    }

    return res.apiv3({
      createdUserList: createUser.createdUserList,
      existingEmailList: createUser.existingEmailList,
      failedEmailList,
    }, 201);
  });

  /**
   * @swagger
   *
   *  paths:
   *    /users/{id}/giveAdmin:
   *      put:
   *        tags: [Users]
   *        operationId: giveAdminUser
   *        summary: /users/{id}/giveAdmin
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

  /**
   * @swagger
   *
   *  paths:
   *    /users/{id}/removeAdmin:
   *      put:
   *        tags: [Users]
   *        operationId: removeAdminUser
   *        summary: /users/{id}/removeAdmin
   *        description: Remove user admin
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of user for removing admin
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Remove user admin success
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userData:
   *                      type: object
   *                      description: data of removed admin user
   */
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
   *    /users/{id}/activate:
   *      put:
   *        tags: [Users]
   *        operationId: activateUser
   *        summary: /users/{id}/activate
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
   *    /users/{id}/deactivate:
   *      put:
   *        tags: [Users]
   *        operationId: deactivateUser
   *        summary: /users/{id}/deactivate
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
   *    /users/{id}/remove:
   *      delete:
   *        tags: [Users]
   *        operationId: removeUser
   *        summary: /users/{id}/remove
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
      await UserGroupRelation.remove({ relatedUser: userData });
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

  /**
   * @swagger
   *
   *  paths:
   *    /users/external-accounts:
   *      get:
   *        tags: [Users]
   *        operationId: listExternalAccountsUsers
   *        summary: /users/external-accounts
   *        description: Get external-account
   *        responses:
   *          200:
   *            description: external-account are fetched
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    paginateResult:
   *                      $ref: '#/components/schemas/PaginateResult'
   */
  router.get('/external-accounts/', loginRequiredStrictly, adminRequired, async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    try {
      const paginateResult = await ExternalAccount.findAllWithPagination({ page });
      return res.apiv3({ paginateResult });
    }
    catch (err) {
      const msg = 'Error occurred in fetching external-account list  ';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg + err.message, 'external-account-list-fetch-failed'), 500);
    }
  });

  /**
   * @swagger
   *
   *  paths:
   *    /users/external-accounts/{id}/remove:
   *      delete:
   *        tags: [Users]
   *        operationId: removeExternalAccountUser
   *        summary: /users/external-accounts/{id}/remove
   *        description: Delete ExternalAccount
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of ExternalAccount
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
  router.delete('/external-accounts/:id/remove', loginRequiredStrictly, adminRequired, apiV3FormValidator, async(req, res) => {
    const { id } = req.params;

    try {
      const externalAccount = await ExternalAccount.findByIdAndRemove(id);

      return res.apiv3({ externalAccount });
    }
    catch (err) {
      const msg = 'Error occurred in deleting a external account  ';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg + err.message, 'extenral-account-delete-failed'));
    }
  });

  /**
   * @swagger
   *
   *  paths:
   *    /users/update.imageUrlCache:
   *      put:
   *        tags: [Users]
   *        operationId: update.imageUrlCache
   *        summary: /users/update.imageUrlCache
   *        description: update imageUrlCache
   *        parameters:
   *          - name:  userIds
   *            in: query
   *            description: user id list
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: success creating imageUrlCached
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userData:
   *                      type: object
   *                      description: users updated with imageUrlCached
   */
  router.put('/update.imageUrlCache', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    try {
      const userIds = req.body.userIds;
      const users = await User.find({ _id: { $in: userIds } });
      const requests = await Promise.all(users.map(async(user) => {
        return {
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { imageUrlCached: await user.generateImageUrlCached() } },
          },
        };
      }));

      if (requests.length > 0) {
        await User.bulkWrite(requests);
      }

      return res.apiv3({});
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
   *    /users/reset-password:
   *      put:
   *        tags: [Users]
   *        operationId: resetPassword
   *        summary: /users/reset-password
   *        description: update imageUrlCache
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  id:
   *                    type: string
   *                    description: user id for reset password
   *        responses:
   *          200:
   *            description: success resrt password
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    newPassword:
   *                      type: string
   *                    user:
   *                      type: object
   *                      description: Target user
   */
  router.put('/reset-password', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const { id } = req.body;

    try {
      const [newPassword, user] = await Promise.all([
        await User.resetPasswordByRandomString(id),
        await User.findById(id)]);

      return res.apiv3({ newPassword, user });
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
   *    /users/send-invitation-email:
   *      put:
   *        tags: [Users]
   *        operationId: sendInvitationEmail
   *        summary: /users/send-invitation-email
   *        description: send invitation email
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  id:
   *                    type: string
   *                    description: user id for send invitation email
   *        responses:
   *          200:
   *            description: success send invitation email
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    failedToSendEmail:
   *                      type: object
   *                      description: email and reasons for email sending failure
   */
  router.put('/send-invitation-email', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const { id } = req.body;

    try {
      const user = await User.findById(id);
      const newPassword = await User.resetPasswordByRandomString(id);
      const userList = [{
        email: user.email,
        password: newPassword,
        user: { id },
      }];
      const sendEmail = await sendEmailByUserList(userList);
      // return null if absent
      return res.apiv3({ failedToSendEmail: sendEmail.failedToSendEmailList[0] });
    }
    catch (err) {
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(err));
    }
  });

  return router;
};
