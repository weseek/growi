import { Container } from 'unstated';
import loggerFactory from '@alias/logger';

import removeNullPropertyFromObject from '../../../lib/util/removeNullPropertyFromObject';

const logger = loggerFactory('growi:services:AdminMikanSecurityContainer');

/**
 * Service container for admin security page (SecurityMikanSetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminMikanSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.dummyApiUrl = 0;
    this.dummyApiUrlForError = 1;

    this.state = {
      retrieveError: null,
      mikanApiUrl: '',
      mikanLoginUrl: '',
      mikanCookieName: '',
      isSameUsernameTreatedAsIdenticalUser: false,
    };

  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    try {
      const response = await this.appContainer.apiv3.get('/security-setting/');
      const { mikanAuth } = response.data.securityParams;
      this.setState({
        mikanApiUrl: mikanAuth.mikanApiUrl,
        mikanLoginUrl: mikanAuth.mikanLoginUrl,
        mikanCookieName: mikanAuth.mikanCookieName,
        isSameUsernameTreatedAsIdenticalUser: mikanAuth.isSameUsernameTreatedAsIdenticalUser,
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
    return 'AdminMikanSecurityContainer';
  }

  /**
   * Change mikanApiUrl
   */
  changeMikanApiUrl(mikanApiUrl) {
    this.setState({ mikanApiUrl });
  }

  /**
   * Change mikanLoginUrl
   */
  changeMikanLoginUrl(mikanLoginUrl) {
    this.setState({ mikanLoginUrl });
  }


  /**
   * Change mikanCookieName
   */
  changeMikanCookieName(mikanCookieName) {
    this.setState({ mikanCookieName });
  }

  /**
   * Switch is same username treated as identical user
   */
     switchIsSameUsernameTreatedAsIdenticalUser() {
      this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
    }

  /**
   * Update mikan option
   */
  async updateMikanSetting() {
    const {
      mikanApiUrl, mikanLoginUrl, mikanCookieName, isSameUsernameTreatedAsIdenticalUser,
    } = this.state;

    let requestParams = {
      mikanApiUrl,
      mikanLoginUrl,
      mikanCookieName,
      isSameUsernameTreatedAsIdenticalUser,
    };

    requestParams = await removeNullPropertyFromObject(requestParams);
    const response = await this.appContainer.apiv3.put('/security-setting/mikan', requestParams);
    const { securitySettingParams } = response.data;

    this.setState({
      mikanApiUrl: securitySettingParams.mikanApiUrl,
      mikanLoginUrl: securitySettingParams.mikanLoginUrl,
      mikanCookieName: securitySettingParams.mikanCookieName,
      isSameUsernameTreatedAsIdenticalUser: securitySettingParams.isSameUsernameTreatedAsIdenticalUser,
    });
    return response;
  }

}
