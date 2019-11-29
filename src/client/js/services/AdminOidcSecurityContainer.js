import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminOidcSecurityLdapContainer');

/**
 * Service container for admin security page (OidcSecurityManagement.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminOidcSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      // TODO GW-583 set value
      callbackUrl: '',
      oidcProviderName: '',
      oidcIssuerHost: '',
      oidcClientId: '',
      oidcClientSecret: '',
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
    return 'AdminOidcSecurityContainer';
  }

  /**
   * Change oidcProviderName
   */
  changeOidcProviderName(inputValue) {
    this.setState({ oidcProviderName: inputValue });
  }

  /**
   * Change oidcIssuerHost
   */
  changeOidcIssuerHost(inputValue) {
    this.setState({ oidcIssuerHost: inputValue });
  }

  /**
   * Change oidcClientId
   */
  changeOidcClientId(inputValue) {
    this.setState({ oidcClientId: inputValue });
  }

  /**
   * Change oidcClientSecret
   */
  changeOidcClientSecret(inputValue) {
    this.setState({ oidcClientSecret: inputValue });
  }

}
