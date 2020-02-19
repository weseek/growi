import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

import { toastError } from '../util/apiNotification';

const logger = loggerFactory('growi:services:AdminNotificationContainer');

/**
 * Service container for admin Notification setting page (NotificationSetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminNotificationContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      retrieveError: null,
      selectSlackOption: 'Incoming Webhooks',
      webhookUrl: '',
      isIncomingWebhookPrioritized: false,
      slackToken: '',
      userNotifications: [],
      globalNotifications: [],
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminNotificationContainer';
  }

  /**
   * Retrieve notificationData
   */
  async retrieveNotificationData() {
    try {
      const response = await this.appContainer.apiv3.get('/notification-setting/');
      const { notificationParams } = response.data;

      this.setState({
        webhookUrl: notificationParams.webhookUrl || '',
        isIncomingWebhookPrioritized: notificationParams.isIncomingWebhookPrioritized || false,
        slackToken: notificationParams.slackToken || '',
        userNotifications: notificationParams.userNotifications || [],
        globalNotifications: notificationParams.globalNotifications || [],
      });

    }
    catch (err) {
      logger.error(err);
      toastError(new Error('Failed to fetch data'));
    }
  }

  /**
   * Switch slackOption
   */
  switchSlackOption(slackOption) {
    this.setState({ selectSlackOption: slackOption });
  }

  /**
   * Change webhookUrl
   */
  changeWebhookUrl(webhookUrl) {
    this.setState({ webhookUrl });
  }

  /**
   * Switch incomingWebhookPrioritized
   */
  switchIsIncomingWebhookPrioritized() {
    this.setState({ isIncomingWebhookPrioritized: !this.state.isIncomingWebhookPrioritized });
  }

  /**
   * Change slackToken
   */
  changeSlackToken(slackToken) {
    this.setState({ slackToken });
  }

  /**
   * Update slackAppConfiguration
   * @memberOf SlackAppConfiguration
   */
  async updateSlackAppConfiguration() {
    const response = await this.appContainer.apiv3.put('/notification-setting/slack-configuration', {
      webhookUrl: this.state.webhookUrl,
      isIncomingWebhookPrioritized: this.state.isIncomingWebhookPrioritized,
      slackToken: this.state.slackToken,
    });

    return response;
  }

  /**
   * Add notificationPattern
   * @memberOf SlackAppConfiguration
   */
  async addNotificationPattern(pathPattern, channel) {
    const response = await this.appContainer.apiv3.post('/notification-setting/user-notification', {
      pathPattern,
      channel,
    });

    this.setState({ userNotifications: response.data.responseParams.userNotifications });
  }

  /**
   * Delete user trigger notification pattern
   */
  async deleteUserTriggerNotificationPattern(notificatiionId) {
    const response = await this.appContainer.apiv3.delete(`/notification-setting/user-notification/${notificatiionId}`);
    const deletedNotificaton = response.data;
    await this.retrieveNotificationData();
    return deletedNotificaton;
  }

  /**
   * Delete global notification pattern
   */
  async deleteGlobalNotificationPattern(notificatiionId) {
    const response = await this.appContainer.apiv3.delete(`/notification-setting/global-notification/${notificatiionId}`);
    const deletedNotificaton = response.data;
    await this.retrieveNotificationData();
    return deletedNotificaton;
  }

}
