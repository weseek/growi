import { isServer } from '@growi/core';
import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';
import { removeNullPropertyFromObject } from '~/utils/object-utils';

import { apiv3Get, apiv3Put } from '../util/apiv3-client';

const logger = loggerFactory('growi:security:AdminTwitterSecurityContainer');

/**
 * Service container for admin security page (BasicSecuritySetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminBasicSecurityContainer extends Container {

  constructor() {
    super();

    if (isServer()) {
      return;
    }

    this.state = {
      isSameUsernameTreatedAsIdenticalUser: false,
    };
  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    try {
      const response = await apiv3Get('/security-setting/');
      const { basicAuth } = response.data.securityParams;
      this.setState({
        isSameUsernameTreatedAsIdenticalUser: basicAuth.isSameUsernameTreatedAsIdenticalUser,
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
    return 'AdminBasicSecurityContainer';
  }

  /**
   * Switch isSameUsernameTreatedAsIdenticalUser
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
  }

  /**
   * Update basicSetting
   */
  async updateBasicSetting() {
    let requestParams = { isSameUsernameTreatedAsIdenticalUser: this.state.isSameUsernameTreatedAsIdenticalUser };

    requestParams = await removeNullPropertyFromObject(requestParams);
    const response = await apiv3Put('/security-setting/basic', requestParams);
    const { securitySettingParams } = response.data;

    this.setState({
      isSameUsernameTreatedAsIdenticalUser: securitySettingParams.isSameUsernameTreatedAsIdenticalUser,
    });
    return response;
  }

}
