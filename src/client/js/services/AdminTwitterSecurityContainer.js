import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminTwitterSecurityContainer');

/**
 * Service container for admin security page (TwitterSecurityManagement.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminTwitterSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      // TODO GW-583 set value
      appSiteUrl: '',
      TwitterConsumerId: '',
      TwitterConsumerSecret: '',
      isSameUsernameTreatedAsIdenticalUser: true,
    };

    this.init();

  }

  init() {
    // TODO GW-583 fetch config value with api
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminTwitterSecurityContainer';
  }

  /**
   * Change TwitterConsumerId
   */
  changeTwitterConsumerId(value) {
    this.setState({ TwitterConsumerId: value });
  }

  /**
   * Change TwitterConsumerSecret
   */
  changeTwitterConsumerSecret(value) {
    this.setState({ TwitterConsumerSecret: value });
  }

  /**
   * Switch isSameUsernameTreatedAsIdenticalUser
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
  }

}
