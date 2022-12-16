import { isServer, pathUtils } from '@growi/core';
import { Container } from 'unstated';
import urljoin from 'url-join';

import loggerFactory from '~/utils/logger';
import { removeNullPropertyFromObject } from '~/utils/object-utils';

import { apiv3Get, apiv3Put } from '../util/apiv3-client';

const logger = loggerFactory('growi:security:AdminSamlSecurityContainer');

/**
 * Service container for admin security page (SecuritySamlSetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminSamlSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    if (isServer()) {
      return;
    }

    this.appContainer = appContainer;

    this.state = {
      retrieveError: null,
      // TODO GW-1324 ABLCRure DB value takes precedence
      useOnlyEnvVars: false,
      missingMandatoryConfigKeys: [],
      samlEntryPoint: '',
      samlIssuer: '',
      samlCert: '',
      samlAttrMapId: '',
      samlAttrMapUsername: '',
      samlAttrMapMail: '',
      samlAttrMapFirstName: '',
      samlAttrMapLastName: '',
      isSameUsernameTreatedAsIdenticalUser: false,
      isSameEmailTreatedAsIdenticalUser: false,
      samlABLCRule: '',
      envEntryPoint: '',
      envIssuer: '',
      envCert: '',
      envAttrMapId: '',
      envAttrMapUsername: '',
      envAttrMapMail: '',
      envAttrMapFirstName: '',
      envAttrMapLastName: '',
      envABLCRule: '',
    };

  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    try {
      const response = await apiv3Get('/security-setting/');
      const { samlAuth } = response.data.securityParams;
      this.setState({
        missingMandatoryConfigKeys: samlAuth.missingMandatoryConfigKeys,
        useOnlyEnvVars: samlAuth.useOnlyEnvVarsForSomeOptions,
        samlEntryPoint: samlAuth.samlEntryPoint,
        samlIssuer: samlAuth.samlIssuer,
        samlCert: samlAuth.samlCert,
        samlAttrMapId: samlAuth.samlAttrMapId,
        samlAttrMapUsername: samlAuth.samlAttrMapUsername,
        samlAttrMapMail: samlAuth.samlAttrMapMail,
        samlAttrMapFirstName: samlAuth.samlAttrMapFirstName,
        samlAttrMapLastName: samlAuth.samlAttrMapLastName,
        isSameUsernameTreatedAsIdenticalUser: samlAuth.isSameUsernameTreatedAsIdenticalUser,
        isSameEmailTreatedAsIdenticalUser: samlAuth.isSameEmailTreatedAsIdenticalUser,
        samlABLCRule: samlAuth.samlABLCRule,
        envEntryPoint: samlAuth.samlEnvVarEntryPoint,
        envIssuer: samlAuth.samlEnvVarIssuer,
        envCert: samlAuth.samlEnvVarCert,
        envAttrMapId: samlAuth.samlEnvVarAttrMapId,
        envAttrMapUsername: samlAuth.samlEnvVarAttrMapUsername,
        envAttrMapMail: samlAuth.samlEnvVarAttrMapMail,
        envAttrMapFirstName: samlAuth.samlEnvVarAttrMapFirstName,
        envAttrMapLastName: samlAuth.samlEnvVarAttrMapLastName,
        envABLCRule: samlAuth.samlEnvVarABLCRule,
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
    return 'AdminSamlSecurityContainer';
  }

  /**
   * Change samlEntryPoint
   */
  changeSamlEntryPoint(inputValue) {
    this.setState({ samlEntryPoint: inputValue });
  }

  /**
   * Change samlIssuer
   */
  changeSamlIssuer(inputValue) {
    this.setState({ samlIssuer: inputValue });
  }

  /**
   * Change samlCert
   */
  changeSamlCert(inputValue) {
    this.setState({ samlCert: inputValue });
  }

  /**
   * Change samlAttrMapId
   */
  changeSamlAttrMapId(inputValue) {
    this.setState({ samlAttrMapId: inputValue });
  }

  /**
   * Change samlAttrMapUsername
   */
  changeSamlAttrMapUserName(inputValue) {
    this.setState({ samlAttrMapUsername: inputValue });
  }

  /**
   * Change samlAttrMapMail
   */
  changeSamlAttrMapMail(inputValue) {
    this.setState({ samlAttrMapMail: inputValue });
  }

  /**
   * Change samlAttrMapFirstName
   */
  changeSamlAttrMapFirstName(inputValue) {
    this.setState({ samlAttrMapFirstName: inputValue });
  }

  /**
   * Change samlAttrMapLastName
   */
  changeSamlAttrMapLastName(inputValue) {
    this.setState({ samlAttrMapLastName: inputValue });
  }

  /**
   * Switch isSameUsernameTreatedAsIdenticalUser
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
  }

  /**
   * Switch isSameEmailTreatedAsIdenticalUser
   */
  switchIsSameEmailTreatedAsIdenticalUser() {
    this.setState({ isSameEmailTreatedAsIdenticalUser: !this.state.isSameEmailTreatedAsIdenticalUser });
  }

  /**
   * Change samlABLCRule
   */
  changeSamlABLCRule(inputValue) {
    this.setState({ samlABLCRule: inputValue });
  }

  /**
   * Update saml option
   */
  async updateSamlSetting() {

    let requestParams = {
      entryPoint: this.state.samlEntryPoint,
      issuer: this.state.samlIssuer,
      cert: this.state.samlCert,
      attrMapId: this.state.samlAttrMapId,
      attrMapUsername: this.state.samlAttrMapUsername,
      attrMapMail: this.state.samlAttrMapMail,
      attrMapFirstName: this.state.samlAttrMapFirstName,
      attrMapLastName: this.state.samlAttrMapLastName,
      isSameUsernameTreatedAsIdenticalUser: this.state.isSameUsernameTreatedAsIdenticalUser,
      isSameEmailTreatedAsIdenticalUser: this.state.isSameEmailTreatedAsIdenticalUser,
      ABLCRule: this.state.samlABLCRule,
    };

    requestParams = await removeNullPropertyFromObject(requestParams);
    const response = await apiv3Put('/security-setting/saml', requestParams);
    const { securitySettingParams } = response.data;

    this.setState({
      missingMandatoryConfigKeys: securitySettingParams.missingMandatoryConfigKeys,
      samlEntryPoint: securitySettingParams.samlEntryPoint,
      samlIssuer: securitySettingParams.samlIssuer,
      samlCert: securitySettingParams.samlCert,
      samlAttrMapId: securitySettingParams.samlAttrMapId,
      samlAttrMapUsername: securitySettingParams.samlAttrMapUsername,
      samlAttrMapMail: securitySettingParams.samlAttrMapMail,
      samlAttrMapFirstName: securitySettingParams.samlAttrMapFirstName,
      samlAttrMapLastName: securitySettingParams.samlAttrMapLastName,
      isSameUsernameTreatedAsIdenticalUser: securitySettingParams.isSameUsernameTreatedAsIdenticalUser,
      isSameEmailTreatedAsIdenticalUser: securitySettingParams.isSameEmailTreatedAsIdenticalUser,
      samlABLCRule: securitySettingParams.samlABLCRule,
    });
    return response;
  }

}
