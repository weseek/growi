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
      samlDbIssuer: samlAuth.samlDbIssuer || '',
      samlDbCert: samlAuth.samlDbCert || '',
      samlDbAttrMapId: samlAuth.samlDbAttrMapId || '',
      samlDbAttrMapUserName: samlAuth.samlDbAttrMapUserName || '',
      samlDbAttrMapMail: samlAuth.samlDbAttrMapMail || '',
      samlDbAttrMapFirstName: samlAuth.samlDbAttrMapFirstName || '',
      samlDbAttrMapLastName: samlAuth.samlDbAttrMapLastName || '',
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

}
