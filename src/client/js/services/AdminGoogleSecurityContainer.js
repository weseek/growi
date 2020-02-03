import { Container } from 'unstated';

import loggerFactory from '@alias/logger';
import { pathUtils } from 'growi-commons';

import urljoin from 'url-join';

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
      callbackUrl: urljoin(pathUtils.removeTrailingSlash(appContainer.config.crowi.url), '/passport/google/callback'),
      googleClientId: '',
      googleClientSecret: '',
      isSameUsernameTreatedAsIdenticalUser: false,
    };


  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    const response = await this.appContainer.apiv3.get('/security-setting/');
    const { googleOAuth } = response.data.securityParams;
    this.setState({
      googleClientId: googleOAuth.googleClientId,
      googleClientSecret: googleOAuth.googleClientSecret,
      isSameUsernameTreatedAsIdenticalUser: googleOAuth.isSameUsernameTreatedAsIdenticalUser,
    });
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

  /**
   * Switch isSameUsernameTreatedAsIdenticalUser
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
  }

  /**
   * Update googleSetting
   */
  async updateGoogleSetting() {

    const response = await this.appContainer.apiv3.put('/security-setting/google-oauth', {
      googleClientId: this.state.googleClientId,
      googleClientSecret: this.state.googleClientSecret,
      isSameUsernameTreatedAsIdenticalUser: this.state.isSameUsernameTreatedAsIdenticalUser,
    });

    const { securitySettingParams } = response.data;

    this.setState({
      googleClientId: securitySettingParams.googleClientId,
      googleClientSecret: securitySettingParams.googleClientSecret,
      isSameUsernameTreatedAsIdenticalUser: securitySettingParams.isSameUsernameTreatedAsIdenticalUser,
    });
    return response;
  }

}
