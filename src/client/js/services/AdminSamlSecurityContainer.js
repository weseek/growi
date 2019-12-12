import { Container } from 'unstated';

import loggerFactory from '@alias/logger';
import { pathUtils } from 'growi-commons';

import urljoin from 'url-join';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminSamlSecurityContainer');

/**
 * Service container for admin security page (SecuritySamlSetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminSamlSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      useOnlyEnvVars: false,
      callbackUrl: urljoin(pathUtils.removeTrailingSlash(appContainer.config.crowi.url), '/passport/saml/callback'),
      missingMandatoryConfigKeys: [],
      samlEntryPoint: '',
      samlIssuer: '',
      samlCert: '',
      samlAttrMapId: '',
      samlAttrMapUserName: '',
      samlAttrMapMail: '',
      samlAttrMapFirstName: '',
      samlAttrMapLastName: '',
      isSameUsernameTreatedAsIdenticalUser: false,
      isSameEmailTreatedAsIdenticalUser: false,
    };

  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    const response = await this.appContainer.apiv3.get('/security-setting/');
    const { samlAuth } = response.data.securityParams;
    this.setState({
      samlEntryPoint: samlAuth.samlEntryPoint || '',
      samlIssuer: samlAuth.samlIssuer || '',
      samlCert: samlAuth.samlCert || '',
      samlAttrMapId: samlAuth.samlAttrMapId || '',
      samlAttrMapUserName: samlAuth.samlAttrMapUserName || '',
      samlAttrMapMail: samlAuth.samlAttrMapMail || '',
      samlAttrMapFirstName: samlAuth.samlAttrMapFirstName || '',
      samlAttrMapLastName: samlAuth.samlAttrMapLastName || '',
      isSameUsernameTreatedAsIdenticalUser: samlAuth.isSameUsernameTreatedAsIdenticalUser || false,
      isSameEmailTreatedAsIdenticalUser: samlAuth.isSameEmailTreatedAsIdenticalUser || false,
    });
    return samlAuth;
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
   * Change samlAttrMapUserName
   */
  changeSamlAttrMapUserName(inputValue) {
    this.setState({ samlAttrMapUserName: inputValue });
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
   * Update saml option
   */
  async updateSamlSetting() {

    const response = await this.appContainer.apiv3.put('/security-setting/saml', {
      samlEntryPoint: this.state.samlEntryPoint,
      samlIssuer: this.state.samlIssuer,
      samlCert: this.state.samlCert,
      samlAttrMapId: this.state.samlAttrMapId,
      samlAttrMapUserName: this.state.samlAttrMapUserName,
      samlAttrMapMail: this.state.samlAttrMapMail,
      samlAttrMapFirstName: this.state.samlAttrMapFirstName,
      samlAttrMapLastName: this.state.samlAttrMapLastName,
      isSameUsernameTreatedAsIdenticalUser: this.state.isSameUsernameTreatedAsIdenticalUser,
      isSameEmailTreatedAsIdenticalUser: this.state.isSameEmailTreatedAsIdenticalUser,
    });

    const { securitySettingParams } = response.data;

    this.setState({
      samlEntryPoint: securitySettingParams.samlEntryPoint || '',
      samlIssuer: securitySettingParams.samlIssuer || '',
      samlCert: securitySettingParams.samlCert || '',
      samlAttrMapId: securitySettingParams.samlAttrMapId || '',
      samlAttrMapUserName: securitySettingParams.samlAttrMapUserName || '',
      samlAttrMapMail: securitySettingParams.samlAttrMapMail || '',
      samlAttrMapFirstName: securitySettingParams.samlAttrMapFirstName || '',
      samlAttrMapLastName: securitySettingParams.samlAttrMapLastName || '',
      isSameUsernameTreatedAsIdenticalUser: securitySettingParams.isSameUsernameTreatedAsIdenticalUser || false,
      isSameEmailTreatedAsIdenticalUser: securitySettingParams.isSameEmailTreatedAsIdenticalUser || false,
    });
    return response;
  }

}
