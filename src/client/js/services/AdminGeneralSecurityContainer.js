import { Container } from 'unstated';

import loggerFactory from '@alias/logger';
import { toastError } from '../util/apiNotification';

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
   * Switch authentication
   */
  async switchAuthentication(auth) {
    const isEnabled = this.state[auth];
    const target = auth.toLowerCase();
    try {
      await this.appContainer.apiv3.put('/security-setting/authentication', {
        isEnabled,
        target,
      });
      this.setState({ [target]: isEnabled });
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Switch local enabled
   */
  async switchIsLocalEnabled() {
    this.switchAuthentication('local');
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
  async switchIsLdapEnabled() {
    this.switchAuthentication('ldap');
  }

  /**
   * Switch SAML enabled
   */
  async switchIsSamlEnabled() {
    this.switchAuthentication('saml');
  }

  /**
   * Switch Oidc enabled
   */
  async switchIsOidcEnabled() {
    this.switchAuthentication('oidc');
  }

  /**
   * Switch Basic enabled
   */
  async switchIsBasicEnabled() {
    this.switchAuthentication('basic');
  }

  /**
   * Switch GoogleOAuth enabled
   */
  async switchIsGoogleOAuthEnabled() {
    this.switchAuthentication('google');
  }

  /**
   * Switch GithubOAuth enabled
   */
  async switchIsGithubOAuthEnabled() {
    this.switchAuthentication('github');
  }

  /**
   * Switch TwitterOAuth enabled
   */
  async switchIsTwitterOAuthEnabled() {
    this.switchAuthentication('twitter');
  }

}
