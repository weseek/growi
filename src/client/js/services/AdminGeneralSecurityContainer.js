import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminGeneralSecurityContainer');

/**
 * Service container for admin security page (SecurityManagement.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminGeneralSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      // TODO GW-583 set value
      useOnlyEnvVarsForSomeOptions: true,
      isLocalEnabled: true,
      registrationMode: 'open',
      registrationWhiteList: '',
      isLdapEnabled: true,
      isSamlEnabled: true,
    };

    this.init();

    this.switchIsLocalEnabled = this.switchIsLocalEnabled.bind(this);
    this.changeRegistrationMode = this.changeRegistrationMode.bind(this);
  }

  init() {
    // TODO GW-583 fetch config value with api
  }


  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminGeneralSecurityContainer';
  }

  /**
   * Switch local enabled
   */
  switchIsLocalEnabled() {
    this.setState({ isLocalEnabled: !this.state.isLocalEnabled });
  }

  /**
   * Change registration mode
   */
  changeRegistrationMode(value) {
    this.setState({ registrationMode: value });
  }

  /**
   * Switch LDAP enabled
   */
  switchIsLdapEnabled() {
    this.setState({ isLdapEnabled: !this.state.isLdapEnabled });
  }

  /**
   * Switch SAML enabled
   */
  switchIsSamlEnabled() {
    this.setState({ isSamlEnabled: !this.state.isSamlEnabled });
  }

}
