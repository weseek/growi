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
      // TODO GW-583 set value
      useOnlyEnvVars: false,
      callbackUrl: urljoin(pathUtils.removeTrailingSlash(appContainer.config.crowi.url), '/passport/saml/callback'),
      missingMandatoryConfigKeys: [],
      samlDbEntryPoint: '',
      samlEnvVarEntryPoint: '',
      samlDbIssuer: '',
      samlEnvVarIssuer: '',
      samlDbCert: '',
      samlEnvVarCert: '',
      samlDbAttrMapId: '',
      samlEnvVarAttrMapId: '',
      samlDbAttrMapUserName: '',
      samlEnvVarAttrMapUserName: '',
      samlDbAttrMapMail: '',
      samlEnvVarAttrMapMail: '',
      samlDbAttrMapFirstName: '',
      samlEnvVarAttrMapFirstName: '',
      samlDbAttrMapLastName: '',
      samlEnvVarAttrMapLastName: '',
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
      samlDbEntryPoint: samlAuth.samlDbEntryPoint || '',
      samlEnvVarEntryPoint: samlAuth.samlEnvVarEntryPoint || '',
      samlDbIssuer: samlAuth.samlDbIssuer || '',
      samlEnvVarIssuer: samlAuth.samlEnvVarIssuer || '',
      samlDbCert: samlAuth.samlDbCert || '',
      samlEnvVarCert: samlAuth.samlEnvVarCert || '',
      samlDbAttrMapId: samlAuth.samlDbAttrMapId || '',
      samlEnvVarAttrMapId: samlAuth.samlEnvVarAttrMapId || '',
      samlDbAttrMapUserName: samlAuth.samlDbAttrMapUserName || '',
      samlEnvVarAttrMapUserName: samlAuth.samlEnvVarAttrMapUserName || '',
      samlDbAttrMapMail: samlAuth.samlDbAttrMapMail || '',
      samlEnvVarAttrMapMail: samlAuth.samlEnvVarAttrMapMail || '',
      samlDbAttrMapFirstName: samlAuth.samlDbAttrMapFirstName || '',
      samlEnvVarAttrMapFirstName: samlAuth.samlEnvVarAttrMapFirstName || '',
      samlDbAttrMapLastName: samlAuth.samlDbAttrMapLastName || '',
      samlEnvVarAttrMapLastName: samlAuth.samlEnvVarAttrMapLastName || '',
      isSameUsernameTreatedAsIdenticalUser: samlAuth.isSameUsernameTreatedAsIdenticalUser || false,
      isSameEmailTreatedAsIdenticalUser: samlAuth.isSameEmailTreatedAsIdenticalUser || false,
    });
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminSamlSecurityContainer';
  }

  /**
   * Change samlDbEntryPoint
   */
  changeSamlDbEntryPoint(inputValue) {
    this.setState({ samlDbEntryPoint: inputValue });
  }

  /**
   * Change samlDbIssuer
   */
  changeSamlDbIssuer(inputValue) {
    this.setState({ samlDbIssuer: inputValue });
  }

  /**
   * Change samlDbCert
   */
  changeSamlDbCert(inputValue) {
    this.setState({ samlDbCert: inputValue });
  }

  /**
   * Change samlDbAttrMapId
   */
  changeSamlDbAttrMapId(inputValue) {
    this.setState({ samlDbAttrMapId: inputValue });
  }

  /**
   * Change samlDbAttrMapUserName
   */
  changeSamlDbAttrMapUserName(inputValue) {
    this.setState({ samlDbAttrMapUserName: inputValue });
  }

  /**
   * Change samlDbAttrMapMail
   */
  changeSamlDbAttrMapMail(inputValue) {
    this.setState({ samlDbAttrMapMail: inputValue });
  }

  /**
   * Change samlDbAttrMapFirstName
   */
  changeSamlDbAttrMapFirstName(inputValue) {
    this.setState({ samlDbAttrMapFirstName: inputValue });
  }

  /**
   * Change samlDbAttrMapLastName
   */
  changeSamlDbAttrMapLastName(inputValue) {
    this.setState({ samlDbAttrMapLastName: inputValue });
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

    // If the value in the database is empty, the value of the environment variable is used
    const response = await this.appContainer.apiv3.put('/security-setting/saml', {
      samlEntryPoint: (this.state.samlDbEntryPoint === '') ? this.state.samlEnvVarEntryPoint : this.state.samlDbEntryPoint,
      samlIssuer: (this.state.samlDbIssuer === '') ? this.state.samlEnvVarIssuer : this.state.samlDbIssuer,
      samlCert: (this.state.samlDbCert === '') ? this.state.samlEnvVarCert : this.state.samlDbCert,
      samlAttrMapId: (this.state.samlDbAttrMapId === '') ? this.state.samlEnvVarAttrMapId : this.state.samlDbAttrMapId,
      samlAttrMapUserName: (this.state.samlDbAttrMapUserName === '') ? this.state.samlEnvVarAttrMapUserName : this.state.samlDbAttrMapUserName,
      samlAttrMapMail: (this.state.samlDbAttrMapMail === '') ? this.state.samlEnvVarAttrMapMail : this.state.samlDbAttrMapMail,
      samlAttrMapFirstName: (this.state.samlDbAttrMapFirstName === '') ? this.state.samlEnvVarAttrMapFirstName : this.state.samlDbAttrMapFirstName,
      samlAttrMapLastName: (this.state.samlDbAttrMapLastName === '') ? this.state.samlEnvVarAttrMapLastName : this.state.samlDbAttrMapLastName,
      isSameUsernameTreatedAsIdenticalUser: this.state.isSameUsernameTreatedAsIdenticalUser || false,
      isSameEmailTreatedAsIdenticalUser: this.state.isSameEmailTreatedAsIdenticalUser || false,
    });

    const { securitySettingParams } = response.data;

    this.setState({
      samlDbEntryPoint: securitySettingParams.samlDbEntryPoint || '',
      samlEnvVarEntryPoint: securitySettingParams.samlEnvVarEntryPoint || '',
      samlDbIssuer: securitySettingParams.samlDbIssuer || '',
      samlEnvVarIssuer: securitySettingParams.samlEnvVarIssuer || '',
      samlDbCert: securitySettingParams.samlDbCert || '',
      samlEnvVarCert: securitySettingParams.samlEnvVarCert || '',
      samlDbAttrMapId: securitySettingParams.samlDbAttrMapId || '',
      samlEnvVarAttrMapId: securitySettingParams.samlEnvVarAttrMapId || '',
      samlDbAttrMapUserName: securitySettingParams.samlDbAttrMapUserName || '',
      samlEnvVarAttrMapUserName: securitySettingParams.samlEnvVarAttrMapUserName || '',
      samlDbAttrMapMail: securitySettingParams.samlDbAttrMapMail || '',
      samlEnvVarAttrMapMail: securitySettingParams.samlEnvVarAttrMapMail || '',
      samlDbAttrMapFirstName: securitySettingParams.samlDbAttrMapFirstName || '',
      samlEnvVarAttrMapFirstName: securitySettingParams.samlEnvVarAttrMapFirstName || '',
      samlDbAttrMapLastName: securitySettingParams.samlDbAttrMapLastName || '',
      samlEnvVarAttrMapLastName: securitySettingParams.samlEnvVarAttrMapLastName || '',
      isSameUsernameTreatedAsIdenticalUser: securitySettingParams.isSameUsernameTreatedAsIdenticalUser || false,
      isSameEmailTreatedAsIdenticalUser: securitySettingParams.isSameEmailTreatedAsIdenticalUser || false,
    });
    return response;
  }

}
