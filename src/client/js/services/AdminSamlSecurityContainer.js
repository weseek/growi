import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

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
      appSiteUrl: false,
      callbackUrl: 'hoge.com',
      missingMandatoryConfigKeys: [],
      samlDbEntryPoint: '',
      samlEnvVarEntryPoint: '',
      samlDbIssuer: '',
      samlEnvVarIssuer: '',
      samlDbCert: '',
      samlEnvVarCert: '',
    };

    this.init();

  }

  init() {
    // TODO GW-583 fetch config value with api
  }


  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminSamlSecurityContainer';
  }

  /**
   * Change saml db entry point
   */
  changeSamlDbEntryPoint(inputValue) {
    this.setState({ samlDbEntryPoint: inputValue });
  }

  /**
   * Change saml db issuer
   */
  changeSamlDbIssuer(inputValue) {
    this.setState({ samlDbIssuer: inputValue });
  }

  /**
   * Change saml db Cert
   */
  changeSamlDbCert(inputValue) {
    this.setState({ samlDbCert: inputValue });
  }

}
