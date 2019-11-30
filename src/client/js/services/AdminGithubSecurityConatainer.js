import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminGithubSecurityContainer');

/**
 * Service container for admin security page (GithubSecurityManagement.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminGithubSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      // TODO GW-583 set value
      appSiteUrl: '',
      githubClientId: '',
      githubClientSecret: '',
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
    return 'AdminGithubSecurityContainer';
  }

  /**
   * Change githubClientId
   */
  changeGithubClientId(value) {
    this.setState({ githubClientId: value });
  }

  /**
   * Change githubClientSecret
   */
  changeGithubClientSecret(value) {
    this.setState({ githubClientSecret: value });
  }

  /**
   * Switch isSameUsernameTreatedAsIdenticalUser
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
  }

}
