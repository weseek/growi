import { Container } from 'unstated';

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

      isSlackbotConfigured: null,
      isSlackLegacyConfigured: null,
      currentBotType: null,

      userNotifications: [],
      isNotificationForOwnerPageEnabled: false,
      isNotificationForGroupPageEnabled: false,
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
    const response = await this.appContainer.apiv3.get('/notification-setting/');
    const { notificationParams } = response.data;

    this.setState({
      isSlackbotConfigured: notificationParams.isSlackbotConfigured,
      isSlackLegacyConfigured: notificationParams.isSlackLegacyConfigured,
      currentBotType: notificationParams.currentBotType,

      userNotifications: notificationParams.userNotifications,
      isNotificationForOwnerPageEnabled: notificationParams.isNotificationForOwnerPageEnabled,
      isNotificationForGroupPageEnabled: notificationParams.isNotificationForGroupPageEnabled,
      globalNotifications: notificationParams.globalNotifications,
    });
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
   * Switch isNotificationForOwnerPageEnabled
   */
  switchIsNotificationForOwnerPageEnabled() {
    this.setState({ isNotificationForOwnerPageEnabled: !this.state.isNotificationForOwnerPageEnabled });
  }

  /**
   * Switch isNotificationForGroupPageEnabled
   */
  switchIsNotificationForGroupPageEnabled() {
    this.setState({ isNotificationForGroupPageEnabled: !this.state.isNotificationForGroupPageEnabled });
  }

  /**
   * Update globalNotificationForPages
   * @memberOf SlackAppConfiguration
   */
  async updateGlobalNotificationForPages() {
    const response = await this.appContainer.apiv3.put('/notification-setting/notify-for-page-grant/', {
      isNotificationForOwnerPageEnabled: this.state.isNotificationForOwnerPageEnabled,
      isNotificationForGroupPageEnabled: this.state.isNotificationForGroupPageEnabled,
    });

    return response;
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
