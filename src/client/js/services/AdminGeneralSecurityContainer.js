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
      appSiteUrl: '',
      isLocalEnabled: true,
      registrationMode: 'open',
      registrationWhiteList: '',
      isLdapEnabled: true,
      isSamlEnabled: true,
      isOidcEnabled: true,
      isBasicEnabled: true,
      isGoogleOAuthEnabled: true,
      isGithubOAuthEnabled: true,
      isTwitterOAuthEnabled: true,
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

  /**
   * Switch Oidc enabled
   */
  switchIsOidcEnabled() {
    this.setState({ isOidcEnabled: !this.state.isOidcEnabled });
  }

  /**
   * Switch Basic enabled
   */
  switchIsBasicEnabled() {
    this.setState({ isBasicEnabled: !this.state.isBasicEnabled });
  }

  /**
   * Switch GoogleOAuth enabled
   */
  switchIsGoogleOAuthEnabled() {
    this.setState({ isGoogleOAuthEnabled: !this.state.isGoogleOAuthEnabled });
  }

  /**
   * Switch GithubOAuth enabled
   */
  switchIsGithubOAuthEnabled() {
    this.setState({ isGithubOAuthEnabled: !this.state.isGithubOAuthEnabled });
  }

  /**
   * Switch TwitterOAuth enabled
   */
  switchIsTwitterOAuthEnabled() {
    this.setState({ isTwitterOAuthEnabled: !this.state.isTwitterOAuthEnabled });
  }


}
