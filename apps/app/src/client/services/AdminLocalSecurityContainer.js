import { isServer } from '@growi/core';
import { Container } from 'unstated';

import Xss from '~/services/xss';
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
    this.xss = new Xss();

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
     * 3. Domain name length must be 1-63 characters
     * 4. Last Tld must be at least 2 and no more than 6 characters and no hyphen (-)
     * 5. Do not use hyphens (-) at the beginning or end of the domain name (e.g. -google.com or google-.com)
     * 6. Domain name can be a subdomain
     * see: https://regex101.com/r/4xc7lg/1
     */
    // eslint-disable-next-line regex/invalid
    const pattern = /^@((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z0-9]{2,6}$/;
    return emailDomain.match(pattern);
  }

  sanitizeRegistrationWhiteList(lines) {
    const sanitizedLines = lines
      .filter(line => line !== '')
      .map((line) => {
        const sanitizedLine = this.xss.process(line);
        if (sanitizedLine !== line || !this.isValidEmailDomain(line)) {
          throw new Error('The input to the white list contains an invalid character. Please enter it in a format such as @growi.org.');
        }
        return sanitizedLine;
      });
    return sanitizedLines;
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

    const sanitizedRegistrationWhiteList = this.sanitizeRegistrationWhiteList(registrationWhiteList);

    const response = await apiv3Put('/security-setting/local-setting', {
      registrationMode: this.state.registrationMode,
      registrationWhiteList: sanitizedRegistrationWhiteList,
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
