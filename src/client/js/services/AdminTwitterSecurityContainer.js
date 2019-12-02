import { Container } from 'unstated';

import loggerFactory from '@alias/logger';
// import { pathUtils } from 'growi-commons';

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
      // callbackUrl: `${pathUtils.removeTrailingSlash(appContainer.config.crowi.url)}/passport/twitter/callback`,
      twitterConsumerId: '',
      twitterConsumerSecret: '',
      isSameUsernameTreatedAsIdenticalUser: true,
    };

    this.init();

  }

  /**
   * retrieve security data
   */
  async init() {
    const response = await this.appContainer.apiv3.get('/security-setting/');
    const { twitterOAuth } = response.data.securityParams;
    this.setState({
      twitterConsumerId: twitterOAuth.twitterConsumerId,
      twitterConsumerSecret: twitterOAuth.twitterConsumerSecret,
      isSameUsernameTreatedAsIdenticalUser: twitterOAuth.isSameUsernameTreatedAsIdenticalUser,
    });
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminTwitterSecurityContainer';
  }

  /**
   * Change twitterConsumerId
   */
  changeTwitterConsumerId(value) {
    this.setState({ twitterConsumerId: value });
  }

  /**
   * Change twitterConsumerSecret
   */
  changeTwitterConsumerSecret(value) {
    this.setState({ twitterConsumerSecret: value });
  }

  /**
   * Switch isSameUsernameTreatedAsIdenticalUser
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
  }

}
