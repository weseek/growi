import { Container } from 'unstated';

import loggerFactory from '@alias/logger';
import { pathUtils } from 'growi-commons';

import urljoin from 'url-join';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminGutHubSecurityContainer');

/**
 * Service container for admin security page (GutHubSecurityManagement.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminGutHubSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      appSiteUrl: urljoin(pathUtils.removeTrailingSlash(appContainer.config.crowi.url), '/passport/github/callback'),
      githubClientId: '',
      githubClientSecret: '',
      isSameUsernameTreatedAsIdenticalUser: true,
    };

  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    const response = await this.appContainer.apiv3.get('/security-setting/');
    const { githubOAuth } = response.data.securityParams;
    this.setState({
      githubClientId: githubOAuth.githubClientId || '',
      githubClientSecret: githubOAuth.githubClientSecret || '',
      isSameUsernameTreatedAsIdenticalUser: githubOAuth.isSameUsernameTreatedAsIdenticalUser || false,
    });
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminGutHubSecurityContainer';
  }

  /**
   * Change githubClientId
   */
  changeGutHubClientId(value) {
    this.setState({ githubClientId: value });
  }

  /**
   * Change githubClientSecret
   */
  changeGutHubClientSecret(value) {
    this.setState({ githubClientSecret: value });
  }

  /**
   * Switch isSameUsernameTreatedAsIdenticalUser
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
  }

  /**
   * Update githubSetting
   */
  async updateGitHubSetting() {

    const response = await this.appContainer.apiv3.put('/security-setting/github-oauth', {
      githubClientId: this.state.githubClientId,
      githubClientSecret: this.state.githubClientSecret,
      isSameUsernameTreatedAsIdenticalUser: this.state.isSameUsernameTreatedAsIdenticalUser,
    });

    const { securitySettingParams } = response.data;

    this.setState({
      isGitHubStrategySetup: securitySettingParams.isGitHubStrategySetup,
      githubClientId: securitySettingParams.githubClientId,
      githubClientSecret: securitySettingParams.githubClientSecret,
      isSameUsernameTreatedAsIdenticalUser: securitySettingParams.isSameUsernameTreatedAsIdenticalUser,
    });
    return response;
  }

}
