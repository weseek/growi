const loggerFactory = require('@alias/logger');

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:routes:apiv3:notification-setting');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');

const ErrorV3 = require('../../models/vo/error-apiv3');

const validator = {
  slackConfiguration: [
    body('webhookUrl').isString().trim(),
    body('isIncomingWebhookPrioritized').isBoolean(),
    body('slackToken').isString().trim(),
  ],
  userNotification: [
    body('pathPattern').isString().trim(),
    body('channel').isString().trim(),
  ],
  globalNotification: [
    body('triggerPath').isString().trim().not()
      .isEmpty(),
    body('notifyToType').isString().trim().isIn(['mail', 'slack']),
    body('toEmail').trim().custom((value, { req }) => {
      return (req.body.notifyToType === 'mail') ? (!!value && value.match(/.+@.+\..+/)) : true;
    }),
    body('slackChannels').trim().custom((value, { req }) => {
      return (req.body.notifyToType === 'slack') ? !!value : true;
    }),
  ],
};

/**
 * @swagger
 *  tags:
 *    name: NotificationSetting
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      SlackConfigurationParams:
 *        type: object
 *        properties:
 *          webhookUrl:
 *            type: string
 *            description: incoming webhooks url
 *          isIncomingWebhookPrioritized:
 *            type: boolean
 *            description: use incoming webhooks even if Slack App settings are enabled
 *          slackToken:
 *            type: string
 *            description: OAuth access token
 *      UserNotificationParams:
 *        type: object
 *        properties:
 *          pathPattern:
 *            type: string
 *            description: path name of wiki
 *          channel:
 *            type: string
 *            description: slack channel name without '#'
 *      GlobalNotificationParams:
 *        type: object
 *        properties:
 *          notifyToType:
 *            type: string
 *            description: What is type for notify
 *          toEmail:
 *            type: string
 *            description: email for notify
 *          slackChannels:
 *            type: string
 *            description: channels for notify
 *          triggerPath:
 *            type: string
 *            description: trigger path for notify
 *          triggerEvents:
 *            type: array
 *            items:
 *              type: string
 *              description: trigger events for notify
 */
module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const UpdatePost = crowi.model('UpdatePost');
  const GlobalNotificationSetting = crowi.model('GlobalNotificationSetting');

  const { ApiV3FormValidator } = crowi.middlewares;

  const GlobalNotificationMailSetting = crowi.models.GlobalNotificationMailSetting;
  const GlobalNotificationSlackSetting = crowi.models.GlobalNotificationSlackSetting;

  /**
   * @swagger
   *
   *    /notification-setting/:
   *      get:
   *        tags: [NotificationSetting]
   *        description: Get notification paramators
   *        responses:
   *          200:
   *            description: params of notification
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    notificationParams:
   *                      type: object
   *                      description: notification params
   */
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {

    const notificationParams = {
      webhookUrl: await crowi.configManager.getConfig('notification', 'slack:incomingWebhookUrl'),
      isIncomingWebhookPrioritized: await crowi.configManager.getConfig('notification', 'slack:isIncomingWebhookPrioritized'),
      slackToken: await crowi.configManager.getConfig('notification', 'slack:token'),
      userNotifications: await UpdatePost.findAll(),
      globalNotifications: await GlobalNotificationSetting.findAll(),
    };
    return res.apiv3({ notificationParams });
  });

  /**
   * @swagger
   *
   *    /notification-setting/slack-configuration:
   *      put:
   *        tags: [NotificationSetting]
   *        description: Update slack configuration setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SlackConfigurationParams'
   *        responses:
   *          200:
   *            description: Succeeded to update slack configuration setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/SlackConfigurationParams'
   */
  router.put('/slack-configuration', loginRequiredStrictly, adminRequired, csrf, validator.slackConfiguration, ApiV3FormValidator, async(req, res) => {

    const requestParams = {
      'slack:incomingWebhookUrl': req.body.webhookUrl,
      'slack:isIncomingWebhookPrioritized': req.body.isIncomingWebhookPrioritized,
      'slack:token': req.body.slackToken,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('notification', requestParams);
      const responseParams = {
        webhookUrl: await crowi.configManager.getConfig('notification', 'slack:incomingWebhookUrl'),
        isIncomingWebhookPrioritized: await crowi.configManager.getConfig('notification', 'slack:isIncomingWebhookPrioritized'),
        slackToken: await crowi.configManager.getConfig('notification', 'slack:token'),
      };
      await crowi.setupSlack();
      return res.apiv3({ responseParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating slack configuration';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-slackConfiguration-failed'));
    }

  });

  /**
  * @swagger
  *
  *    /notification-setting/user-notification:
  *      post:
  *        tags: [NotificationSetting]
  *        description: add user notification setting
  *        requestBody:
  *          required: true
  *          content:
  *            application/json:
  *              schema:
  *                $ref: '#/components/schemas/UserNotificationParams'
  *        responses:
  *          200:
  *            description: Succeeded to add user notification setting
  *            content:
  *              application/json:
  *                schema:
  *                  properties:
  *                    createdUser:
  *                      type: object
  *                      description: user who set notification
  *                    userNotifications:
  *                      type: object
  *                      description: user trigger notifications for updated
  */
  router.post('/user-notification', loginRequiredStrictly, adminRequired, csrf, validator.userNotification, ApiV3FormValidator, async(req, res) => {
    const { pathPattern, channel } = req.body;
    const UpdatePost = crowi.model('UpdatePost');

    try {
      logger.info('notification.add', pathPattern, channel);
      const responseParams = {
        createdUser: await UpdatePost.create(pathPattern, channel, req.user),
        userNotifications: await UpdatePost.findAll(),
      };
      return res.apiv3({ responseParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating user notification';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-userNotification-failed'));
    }

  });

  /**
   * @swagger
   *
   *    /notification-setting/user-notification/{id}:
   *      delete:
   *        tags: [NotificationSetting]
   *        description: delete user trigger notification pattern
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of user trigger notification
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Succeeded to delete user trigger notification pattern
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    deletedNotificaton:
   *                      type: object
   *                      description: deleted notification
   */
  router.delete('/user-notification/:id', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const { id } = req.params;

    try {
      const deletedNotificaton = await UpdatePost.remove(id);
      return res.apiv3(deletedNotificaton);
    }
    catch (err) {
      const msg = 'Error occurred in delete user trigger notification';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'delete-userTriggerNotification-failed'));
    }


  });

  /**
   * @swagger
   *
   *    /notification-setting/global-notification:
   *      post:
   *        tags: [NotificationSetting]
   *        description: add global notification
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/GlobalNotificationParams'
   *        responses:
   *          200:
   *            description: Succeeded to add global notification
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    createdNotification:
   *                      type: object
   *                      description: notification param created
   */
  router.post('/global-notification', loginRequiredStrictly, adminRequired, csrf, validator.globalNotification, ApiV3FormValidator, async(req, res) => {

    const {
      notifyToType, toEmail, slackChannels, triggerPath, triggerEvents,
    } = req.body;

    let notification;

    if (notifyToType === GlobalNotificationSetting.TYPE.MAIL) {
      notification = new GlobalNotificationMailSetting(crowi);
      notification.toEmail = toEmail;
    }
    if (notifyToType === GlobalNotificationSetting.TYPE.SLACK) {
      notification = new GlobalNotificationSlackSetting(crowi);
      notification.slackChannels = slackChannels;
    }

    notification.triggerPath = triggerPath;
    notification.triggerEvents = triggerEvents || [];

    try {
      const createdNotification = await notification.save();
      return res.apiv3({ createdNotification });
    }
    catch (err) {
      const msg = 'Error occurred in updating global notification';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'post-globalNotification-failed'));
    }

  });

  /**
   * @swagger
   *
   *    /notification-setting/global-notification/{id}:
   *      put:
   *        tags: [NotificationSetting]
   *        description: update global notification
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: global notification id for updated
   *            schema:
   *              type: string
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/GlobalNotificationParams'
   *        responses:
   *          200:
   *            description: Succeeded to update global notification
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    createdNotification:
   *                      type: object
   *                      description: notification param updated
   */
  router.put('/global-notification/:id', loginRequiredStrictly, adminRequired, csrf, validator.globalNotification, ApiV3FormValidator, async(req, res) => {
    const { id } = req.params;
    const {
      notifyToType, toEmail, slackChannels, triggerPath, triggerEvents,
    } = req.body;

    const models = {
      [GlobalNotificationSetting.TYPE.MAIL]: GlobalNotificationMailSetting,
      [GlobalNotificationSetting.TYPE.SLACK]: GlobalNotificationSlackSetting,
    };

    try {
      let setting = await GlobalNotificationSetting.findOne({ _id: id });
      setting = setting.toObject();

      // when switching from one type to another,
      // remove toEmail from slack setting and slackChannels from mail setting
      if (setting.__t !== notifyToType) {
        setting = models[setting.__t].hydrate(setting);
        setting.toEmail = undefined;
        setting.slackChannels = undefined;
        await setting.save();
        setting = setting.toObject();
      }

      if (notifyToType === GlobalNotificationSetting.TYPE.MAIL) {
        setting = GlobalNotificationMailSetting.hydrate(setting);
        setting.toEmail = toEmail;
      }
      if (notifyToType === GlobalNotificationSetting.TYPE.SLACK) {
        setting = GlobalNotificationSlackSetting.hydrate(setting);
        setting.slackChannels = slackChannels;
      }

      setting.__t = notifyToType;
      setting.triggerPath = triggerPath;
      setting.triggerEvents = triggerEvents || [];

      const createdNotification = await setting.save();
      return res.apiv3({ createdNotification });
    }
    catch (err) {
      const msg = 'Error occurred in updating global notification';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'post-globalNotification-failed'));
    }

  });

  /**
   * @swagger
   *
   *    /notification-setting/global-notification/{id}/enabled:
   *      put:
   *        tags: [NotificationSetting]
   *        description: toggle enabled global notification
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: notification id for updated
   *            schema:
   *              type: string
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  isEnabled:
   *                    type: boolean
   *                    description: is notification enabled
   *        responses:
   *          200:
   *            description: Succeeded to delete global notification pattern
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    deletedNotificaton:
   *                      type: object
   *                      description: notification id for updated
   */
  router.put('/global-notification/:id/enabled', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const { id } = req.params;
    const { isEnabled } = req.body;

    try {
      if (isEnabled) {
        await GlobalNotificationSetting.enable(id);
      }
      else {
        await GlobalNotificationSetting.disable(id);
      }

      return res.apiv3({ id });

    }
    catch (err) {
      const msg = 'Error occurred in toggle of global notification';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'toggle-globalNotification-failed'));
    }

  });

  /**
  * @swagger
  *
  *    /notification-setting/global-notification/{id}:
  *      delete:
  *        tags: [NotificationSetting]
  *        description: delete global notification pattern
  *        parameters:
  *          - name: id
  *            in: path
  *            required: true
  *            description: id of global notification
  *            schema:
  *              type: string
  *        responses:
  *          200:
  *            description: Succeeded to delete global notification pattern
  *            content:
  *              application/json:
  *                schema:
  *                  properties:
  *                    deletedNotificaton:
  *                      type: object
  *                      description: deleted notification
  */
  router.delete('/global-notification/:id', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const { id } = req.params;

    try {
      const deletedNotificaton = await GlobalNotificationSetting.findOneAndRemove({ _id: id });
      return res.apiv3(deletedNotificaton);
    }
    catch (err) {
      const msg = 'Error occurred in delete global notification';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'delete-globalNotification-failed'));
    }


  });

  return router;
};
