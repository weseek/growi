import { isServer } from '@growi/core';
import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';

import { apiv3Get, apiv3Put } from '../util/apiv3-client';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:AdminLocalSecurityContainer');
/**
 * Service container for admin security page (LocalSecuritySetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminLocalSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    if (isServer()) {
      return;
    }

    this.appContainer = appContainer;
    this.dummyRegistrationMode = 0;
    this.dummyRegistrationModeForError = 1;

    this.state = {
      retrieveError: null,
      // set dummy value tile for using suspense
      registrationMode: this.dummyRegistrationMode,
      registrationWhiteList: [],
      useOnlyEnvVars: false,
      isPasswordResetEnabled: false,
      isEmailAuthenticationEnabled: false,
    };

  }

  async retrieveSecurityData() {
    try {
      const response = await apiv3Get('/security-setting/');
      const { localSetting } = response.data.securityParams;
      this.setState({
        useOnlyEnvVars: localSetting.useOnlyEnvVarsForSomeOptions,
        registrationMode: localSetting.registrationMode,
        registrationWhiteList: localSetting.registrationWhiteList,
        isPasswordResetEnabled: localSetting.isPasswordResetEnabled,
        isEmailAuthenticationEnabled: localSetting.isEmailAuthenticationEnabled,
      });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to fetch data');
    }

  }

  isValidEmailDomain(emailDomain) {
    /**
     * 1. Must start with an "@"
     * 2. Domain name must be a-z | A-Z | 0-9 and hyphen (-)
     * 3. Do not use hyphens (-) at the beginning or end of the domain name (e.g. -example.com or example-.com)
     * 4. Domain name length must be 1-63 characters
     * 5. Domain name can be a subdomain
     * 6. Last Tld must be at least 2 and no more than 6 characters and no hyphen (-)
     * 7. Total length must be less than 253 characters excluding "@"
     * ref: https://www.nic.ad.jp/ja/dom/system.html
     * see: https://regex101.com/r/xUJnJ4/1
     */
    // eslint-disable-next-line regex/invalid
    const pattern = /^@(?=.{1,253}$)((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z0-9]{2,6}$/;
    return emailDomain.match(pattern);
  }

  validateRegistrationWhiteList(whiteList) {
    return whiteList
      .filter(line => line !== '')
      .map((line) => {
        if (!this.isValidEmailDomain(line)) {
          throw new Error('The input to the white list contains an invalid character. Please enter it in a format such as @growi.org.');
        }
        return line;
      });
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminLocalSecurityContainer';
  }

  /**
   * Change registration mode
   */
  changeRegistrationMode(value) {
    this.setState({ registrationMode: value });
  }

  /**
   * Change registration white list
   */
  changeRegistrationWhiteList(value) {
    this.setState({ registrationWhiteList: value.split('\n') });
  }

  /**
   * Switch password reset enabled
   */
  switchIsPasswordResetEnabled() {
    this.setState({ isPasswordResetEnabled: !this.state.isPasswordResetEnabled });
  }

  /**
   * Switch email authentication enabled
   */
  switchIsEmailAuthenticationEnabled() {
    this.setState({ isEmailAuthenticationEnabled: !this.state.isEmailAuthenticationEnabled });
  }

  /**
   * update local security setting
   */
  async updateLocalSecuritySetting() {
    const { registrationWhiteList, isPasswordResetEnabled, isEmailAuthenticationEnabled } = this.state;

    const validatedRegistrationWhiteList = this.validateRegistrationWhiteList(registrationWhiteList);

    const response = await apiv3Put('/security-setting/local-setting', {
      registrationMode: this.state.registrationMode,
      registrationWhiteList: validatedRegistrationWhiteList,
      isPasswordResetEnabled,
      isEmailAuthenticationEnabled,
    });

    const { localSettingParams } = response.data;

    this.setState({
      registrationMode: localSettingParams.registrationMode,
      registrationWhiteList: localSettingParams.registrationWhiteList,
      isPasswordResetEnabled: localSettingParams.isPasswordResetEnabled,
      isEmailAuthenticationEnabled: localSettingParams.isEmailAuthenticationEnabled,
    });

    return localSettingParams;
  }

}
