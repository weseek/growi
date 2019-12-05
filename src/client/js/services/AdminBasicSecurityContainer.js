import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminBasicSecurityContainer');

/**
 * Service container for admin security page (BasicSecuritySetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminBasicSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      isSameUsernameTreatedAsIdenticalUser: false,
    };

  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    const response = await this.appContainer.apiv3.get('/security-setting/');
    const { basic } = response.data.securityParams;
    this.setState({
      isSameUsernameTreatedAsIdenticalUser: basic.isSameUsernameTreatedAsIdenticalUser || false,
    });
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminBasicSecurityContainer';
  }

  /**
   * Switch isSameUsernameTreatedAsIdenticalUser
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
  }

}
