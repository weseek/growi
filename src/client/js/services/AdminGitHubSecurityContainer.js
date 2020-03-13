import { Container } from 'unstated';
import loggerFactory from '@alias/logger';

import { pathUtils } from 'growi-commons';
import urljoin from 'url-join';
import removeNullPropertyFromObject from '../../../lib/util/removeNullPropertyFromObject';

const logger = loggerFactory('growi:security:AdminGitHubSecurityContainer');

/**
 * Service container for admin security page (GitHubSecurityManagement.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminGitHubSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      retrieveError: null,
      appSiteUrl: urljoin(pathUtils.removeTrailingSlash(appContainer.config.crowi.url), '/passport/github/callback'),
      githubClientId: '',
      githubClientSecret: '',
      isSameUsernameTreatedAsIdenticalUser: false,
    };

  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    try {
      const response = await this.appContainer.apiv3.get('/security-setting/');
      const { githubOAuth } = response.data.securityParams;
      this.setState({
        githubClientId: githubOAuth.githubClientId,
        githubClientSecret: githubOAuth.githubClientSecret,
        isSameUsernameTreatedAsIdenticalUser: githubOAuth.isSameUsernameTreatedAsIdenticalUser,
      });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to fetch data');
    }
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminGitHubSecurityContainer';
  }

  /**
   * Change githubClientId
   */
  changeGitHubClientId(value) {
    this.setState({ githubClientId: value });
  }

  /**
   * Change githubClientSecret
   */
  changeGitHubClientSecret(value) {
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
    const { githubClientId, githubClientSecret, isSameUsernameTreatedAsIdenticalUser } = this.state;

    let requestParams = { githubClientId, githubClientSecret, isSameUsernameTreatedAsIdenticalUser };

    requestParams = await removeNullPropertyFromObject(requestParams);
    const response = await this.appContainer.apiv3.put('/security-setting/github-oauth', requestParams);
    const { securitySettingParams } = response.data;

    this.setState({
      githubClientId: securitySettingParams.githubClientId,
      githubClientSecret: securitySettingParams.githubClientSecret,
      isSameUsernameTreatedAsIdenticalUser: securitySettingParams.isSameUsernameTreatedAsIdenticalUser,
    });
    return response;
  }

}
