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
      webhookUrl: '',
      isIncomingWebhookPrioritized: false,
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminNotificationContainer';
  }

  /**
   * Change webhookUrl
   */
  changeWebhookUrl(inputValue) {
    this.setState({ webhookUrl: inputValue });
  }

  /**
   * Switch incomingWebhookPrioritized
   */
  switchIsIncomingWebhookPrioritized() {
    this.setState({ isIncomingWebhookPrioritized: !this.state.isIncomingWebhookPrioritized });
  }

}
