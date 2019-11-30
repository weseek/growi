import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminGoogleSecurityContainer');

/**
 * Service container for admin security page (GoogleSecurityManagement.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminGoogleSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      // TODO GW-583 set value
      appSiteUrl: '',
      googleClientId: '',
      googleClientSecret: '',
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
    return 'AdminGoogleSecurityContainer';
  }

  /**
   * Change googleClientId
   */
  changeGoogleClientId(value) {
    this.setState({ googleClientId: value });
  }

  /**
   * Change googleClientSecret
   */
  changeGoogleClientSecret(value) {
    this.setState({ googleClientSecret: value });
  }

}
