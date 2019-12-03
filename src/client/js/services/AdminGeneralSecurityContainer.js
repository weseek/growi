import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminGeneralSecurityContainer');

/**
 * Service container for admin security page (SecurityManagement.jsx)
 * Service container for admin security page (SecuritySetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminGeneralSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      // TODO GW-583 set value
      isWikiModeForced: false,
      currentRestrictGuestMode: 'deny',
      currentpageCompleteDeletionAuthority: 'anyone',
      isHideRestrictedByOwner: true,
      isHideRestrictedByGroup: true,
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
    this.changeRestrictGuestMode = this.changeRestrictGuestMode.bind(this);
    this.switchIsHideRestrictedByGroup = this.switchIsHideRestrictedByGroup.bind(this);
    this.switchIsHideRestrictedByOwner = this.switchIsHideRestrictedByOwner.bind(this);
    this.changePageCompleteDeletionAuthority = this.changePageCompleteDeletionAuthority.bind(this);
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
   * Change restrictGuestMode
   */
  changeRestrictGuestMode(restrictGuestModeLabel) {
    this.setState({ currentRestrictGuestMode: restrictGuestModeLabel });
  }

  /**
   * Change pageCompleteDeletionAuthority
   */
  changePageCompleteDeletionAuthority(pageCompleteDeletionAuthorityLabel) {
    this.setState({ currentpageCompleteDeletionAuthority: pageCompleteDeletionAuthorityLabel });
  }

  /**
   * Switch hideRestrictedByOwner
   */
  switchIsHideRestrictedByOwner() {
    this.setState({ isHideRestrictedByOwner:  !this.state.isHideRestrictedByOwner });
  }

  /**
   * Switch hideRestrictedByGroup
   */
  switchIsHideRestrictedByGroup() {
    this.setState({ isHideRestrictedByGroup:  !this.state.isHideRestrictedByGroup });
  }


  /**
   * Update restrictGuestMode
   * @memberOf AdminGeneralSecuritySContainer
   * @return {string} Appearance
   */
  async updateGeneralSecuritySetting() {
    const response = await this.appContainer.apiv3.put('/security-setting/general-setting', {
      restrictGuestMode: this.state.currentRestrictGuestMode,
      pageCompleteDeletionAuthority: this.state.currentPageCompleteDeletionAuthority,
      hideRestrictedByGroup: this.state.hideRestrictedByGroup,
      hideRestrictedByOwner: this.state.hideRestrictedByOwner,
    });
    const { securitySettingParams } = response.data;
    return securitySettingParams;
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
