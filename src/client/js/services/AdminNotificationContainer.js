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
      selectSlackOption: 'Incoming Webhooks',
      webhookUrl: '',
      isIncomingWebhookPrioritized: false,
      slackToken: '',
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
  retrieveNotificationData() {
    // TODO retrive data from api
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

}
