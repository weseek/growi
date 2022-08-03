import { isServer, pathUtils } from '@growi/core';
import { Container } from 'unstated';
import urljoin from 'url-join';

import loggerFactory from '~/utils/logger';
import { removeNullPropertyFromObject } from '~/utils/object-utils';

import { apiv3Get, apiv3Put } from '../util/apiv3-client';

const logger = loggerFactory('growi:security:AdminGoogleSecurityContainer');

/**
 * Service container for admin security page (GoogleSecurityManagement.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminGoogleSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    if (isServer()) {
      return;
    }

    this.dummyGoogleClientId = 0;
    this.dummyGoogleClientIdForError = 1;

    this.state = {
      retrieveError: null,
      // set dummy value tile for using suspense
      googleClientId: this.dummyGoogleClientId,
      googleClientSecret: '',
      isSameEmailTreatedAsIdenticalUser: false,
    };


  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    try {
      const response = await apiv3Get('/security-setting/');
      const { googleOAuth } = response.data.securityParams;
      this.setState({
        googleClientId: googleOAuth.googleClientId,
        googleClientSecret: googleOAuth.googleClientSecret,
        isSameEmailTreatedAsIdenticalUser: googleOAuth.isSameEmailTreatedAsIdenticalUser,
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
   * Switch isSameEmailTreatedAsIdenticalUser
   */
  switchIsSameEmailTreatedAsIdenticalUser() {
    this.setState({ isSameEmailTreatedAsIdenticalUser: !this.state.isSameEmailTreatedAsIdenticalUser });
  }


  /**
   * Update googleSetting
   */
  async updateGoogleSetting() {
    const { googleClientId, googleClientSecret, isSameEmailTreatedAsIdenticalUser } = this.state;
    console.log('updateGoogleSetting', isSameEmailTreatedAsIdenticalUser);

    let requestParams = {
      googleClientId, googleClientSecret, isSameEmailTreatedAsIdenticalUser,
    };

    requestParams = await removeNullPropertyFromObject(requestParams);
    const response = await apiv3Put('/security-setting/google-oauth', requestParams);
    const { securitySettingParams } = response.data;

    this.setState({
      googleClientId: securitySettingParams.googleClientId,
      googleClientSecret: securitySettingParams.googleClientSecret,
      isSameEmailTreatedAsIdenticalUser: securitySettingParams.isSameEmailTreatedAsIdenticalUser,
    });
    return response;
  }

}
