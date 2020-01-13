import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminGeneralSecurityContainer');

/**
 * Service container for admin security page (SecuritySetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminGeneralSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      isWikiModeForced: false,
      wikiMode: '',
      currentRestrictGuestMode: 'deny',
      currentPageCompleteDeletionAuthority: 'anyone',
      isHideRestrictedByOwner: true,
      isHideRestrictedByGroup: true,
      useOnlyEnvVarsForSomeOptions: true,
      appSiteUrl: appContainer.config.crowi.url || '',
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
      optionError: null,
    };

    this.onIsWikiModeForced = this.onIsWikiModeForced.bind(this);
  }

  async retrieveSecurityData() {
    const response = await this.appContainer.apiv3.get('/security-setting/');
    const { generalSetting } = response.data.securityParams;
    const { localSetting } = response.data.securityParams;
    this.onIsWikiModeForced(generalSetting.wikiMode);
    this.setState({
      currentRestrictGuestMode: generalSetting.restrictGuestMode || 'deny',
      currentPageCompleteDeletionAuthority: generalSetting.pageCompleteDeletionAuthority || 'anyone',
      isHideRestrictedByOwner: generalSetting.hideRestrictedByOwner || false,
      isHideRestrictedByGroup: generalSetting.hideRestrictedByGroup || false,
      wikiMode: generalSetting.wikiMode || '',
      isLocalEnabled: localSetting.isLocalEnabled || false,
      registrationMode: localSetting.registrationMode || 'open',
      registrationWhiteList: localSetting.registrationWhiteList.join('\n') || '',
    });
  }


  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminGeneralSecurityContainer';
  }

  /**
   * Check one option is enabled at least
   */
  isEnabledOneOptionAtLeast() {
    return (
      this.state.isLocalEnabled
                 || this.state.isLdapEnabled
                 || this.state.isSamlEnabled
                 || this.state.isOidcEnabled
                 || this.state.isBasicEnabled
                 || this.state.isGoogleOAuthEnabled
                 || this.state.isGithubOAuthEnabled
                 || this.state.isTwitterOAuthEnabled
    );
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
    this.setState({ currentPageCompleteDeletionAuthority: pageCompleteDeletionAuthorityLabel });
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

  onIsWikiModeForced(wikiModeSetting) {
    if (wikiModeSetting === 'private') {
      this.setState({ isWikiModeForced: true });
    }
    else {
      this.setState({ isWikiModeForced: false });
    }
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
      hideRestrictedByGroup: this.state.isHideRestrictedByGroup,
      hideRestrictedByOwner: this.state.isHideRestrictedByOwner,
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
   * Change registration white list
   */
  changeRegistrationWhiteList(value) {
    this.setState({ registrationWhiteList: value });
  }

  /**
  * update local security setting
  */
  async updateLocalSecuritySetting() {
    let { registrationWhiteList } = this.state;
    registrationWhiteList = Array.isArray(registrationWhiteList) ? registrationWhiteList : registrationWhiteList.split('\n');
    const response = await this.appContainer.apiv3.put('/security-setting/local-setting', {
      isLocalEnabled: this.state.isLocalEnabled,
      registrationMode: this.state.registrationMode,
      registrationWhiteList,
    });
    const { localSecuritySettingParams } = response.data;
    return localSecuritySettingParams;
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
