import { Container } from 'unstated';

import { toastError } from '../util/apiNotification';
import removeNullPropertyFromObject from '../../../lib/util/removeNullPropertyFromObject';

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
      currentRestrictGuestMode: 'Deny',
      currentPageCompleteDeletionAuthority: 'adminOnly',
      isShowRestrictedByOwner: false,
      isShowRestrictedByGroup: false,
      useOnlyEnvVarsForSomeOptions: false,
      appSiteUrl: appContainer.config.crowi.url || '',
      isLocalEnabled: false,
      isLdapEnabled: false,
      isSamlEnabled: false,
      isOidcEnabled: false,
      isBasicEnabled: false,
      isGoogleEnabled: false,
      isGitHubEnabled: false,
      isTwitterEnabled: false,
      setupStrategies: [],
    };

    this.onIsWikiModeForced = this.onIsWikiModeForced.bind(this);
  }

  async retrieveSecurityData() {
    await this.retrieveSetupStratedies();
    const response = await this.appContainer.apiv3.get('/security-setting/');
    const { generalSetting, generalAuth } = response.data.securityParams;
    this.onIsWikiModeForced(generalSetting.wikiMode);
    this.setState({
      currentPageCompleteDeletionAuthority: generalSetting.pageCompleteDeletionAuthority,
      isShowRestrictedByOwner: !generalSetting.hideRestrictedByOwner,
      isShowRestrictedByGroup: !generalSetting.hideRestrictedByGroup,
      wikiMode: generalSetting.wikiMode,
      isLocalEnabled: generalAuth.isLocalEnabled,
      isLdapEnabled: generalAuth.isLdapEnabled,
      isSamlEnabled: generalAuth.isSamlEnabled,
      isOidcEnabled: generalAuth.isOidcEnabled,
      isBasicEnabled: generalAuth.isBasicEnabled,
      isGoogleEnabled: generalAuth.isGoogleEnabled,
      isGitHubEnabled: generalAuth.isGitHubEnabled,
      isTwitterEnabled: generalAuth.isTwitterEnabled,
    });
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
    this.setState({ currentPageCompleteDeletionAuthority: pageCompleteDeletionAuthorityLabel });
  }

  /**
   * Switch showRestrictedByOwner
   */
  switchIsShowRestrictedByOwner() {
    this.setState({ isShowRestrictedByOwner:  !this.state.isShowRestrictedByOwner });
  }

  /**
   * Switch showRestrictedByGroup
   */
  switchIsShowRestrictedByGroup() {
    this.setState({ isShowRestrictedByGroup:  !this.state.isShowRestrictedByGroup });
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

    let requestParams = {
      restrictGuestMode: this.state.currentRestrictGuestMode,
      pageCompleteDeletionAuthority: this.state.currentPageCompleteDeletionAuthority,
      hideRestrictedByGroup: !this.state.isShowRestrictedByGroup,
      hideRestrictedByOwner: !this.state.isShowRestrictedByOwner,
    };

    requestParams = await removeNullPropertyFromObject(requestParams);
    const response = await this.appContainer.apiv3.put('/security-setting/general-setting', requestParams);
    const { securitySettingParams } = response.data;
    return securitySettingParams;
  }

  /**
   * Switch authentication
   */
  async switchAuthentication(stateVariableName, authId) {
    const isEnabled = !this.state[stateVariableName];
    try {
      await this.appContainer.apiv3.put('/security-setting/authentication/enabled', {
        isEnabled,
        authId,
      });
      await this.retrieveSetupStratedies();
      this.setState({ [stateVariableName]: isEnabled });
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Retrieve SetupStratedies
   */
  async retrieveSetupStratedies() {
    try {
      const response = await this.appContainer.apiv3.get('/security-setting/authentication');
      const { setupStrategies } = response.data;
      this.setState({ setupStrategies });
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Switch local enabled
   */
  async switchIsLocalEnabled() {
    this.switchAuthentication('isLocalEnabled', 'local');
  }

  /**
   * Switch LDAP enabled
   */
  async switchIsLdapEnabled() {
    this.switchAuthentication('isLdapEnabled', 'ldap');
  }

  /**
   * Switch SAML enabled
   */
  async switchIsSamlEnabled() {
    this.switchAuthentication('isSamlEnabled', 'saml');
  }

  /**
   * Switch Oidc enabled
   */
  async switchIsOidcEnabled() {
    this.switchAuthentication('isOidcEnabled', 'oidc');
  }

  /**
   * Switch Basic enabled
   */
  async switchIsBasicEnabled() {
    this.switchAuthentication('isBasicEnabled', 'basic');
  }

  /**
   * Switch GoogleOAuth enabled
   */
  async switchIsGoogleOAuthEnabled() {
    this.switchAuthentication('isGoogleEnabled', 'google');
  }

  /**
   * Switch GitHubOAuth enabled
   */
  async switchIsGitHubOAuthEnabled() {
    this.switchAuthentication('isGitHubEnabled', 'github');
  }

  /**
   * Switch TwitterOAuth enabled
   */
  async switchIsTwitterOAuthEnabled() {
    this.switchAuthentication('isTwitterEnabled', 'twitter');
  }

}
