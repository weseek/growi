import { Container } from 'unstated';

import loggerFactory from '@alias/logger';
import { pathUtils } from 'growi-commons';

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
      appSiteUrl: `${pathUtils.removeTrailingSlash(appContainer.config.crowi.url)}/passport/github/callback`,
      githubClientId: '',
      githubClientSecret: '',
      isSameUsernameTreatedAsIdenticalUser: true,
    };

    this.init();

  }

  async init() {
    const response = await this.appContainer.apiv3.get('/security-setting/');
    const { githubOAuth } = response.data.securityParams;
    this.setState({
      githubClientId: githubOAuth.githubClientId,
      githubClientSecret: githubOAuth.githubClientSecret,
      isSameUsernameTreatedAsIdenticalUser: githubOAuth.isSameUsernameTreatedAsIdenticalUser,
    });
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
