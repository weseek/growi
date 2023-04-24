import { isServer, isValidEmailDomain } from '@growi/core';
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

  validateRegistrationWhiteList(whiteList) {
    return whiteList
      .filter(line => line !== '')
      .map((line) => {
        if (!isValidEmailDomain(line)) {
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
