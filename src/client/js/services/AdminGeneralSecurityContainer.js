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
   * Switch local enabled
   */
  async switchIsLocalEnabled() {
    try {
      await this.appContainer.apiv3.put('/security-setting/authentication', {
        isEnabled: !this.state.isLocalEnabled,
        target: 'local',
      });
      this.setState({ isLocalEnabled: !this.state.isLocalEnabled });
    }
    catch (err) {
      toastError(err);
    }
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
    try {
      await this.appContainer.apiv3.put('/security-setting/authentication', {
        isEnabled: !this.state.isLdapEnabled,
        target: 'ldap',
      });
      this.setState({ isLdapEnabled: !this.state.isLdapEnabled });
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Switch SAML enabled
   */
  async switchIsSamlEnabled() {
    try {
      await this.appContainer.apiv3.put('/security-setting/authentication', {
        isEnabled: !this.state.isSamlEnabled,
        target: 'saml',
      });
      this.setState({ isSamlEnabled: !this.state.isSamlEnabled });
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Switch Oidc enabled
   */
  async switchIsOidcEnabled() {
    try {
      await this.appContainer.apiv3.put('/security-setting/authentication', {
        isEnabled: !this.state.isOidcEnabled,
        target: 'oidc',
      });
      this.setState({ isOidcEnabled: !this.state.isOidcEnabled });
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Switch Basic enabled
   */
  async switchIsBasicEnabled() {
    try {
      await this.appContainer.apiv3.put('/security-setting/authentication', {
        isEnabled: !this.state.isBasicEnabled,
        target: 'basic',
      });
      this.setState({ isBasicEnabled: !this.state.isBasicEnabled });
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Switch GoogleOAuth enabled
   */
  async switchIsGoogleOAuthEnabled() {
    try {
      await this.appContainer.apiv3.put('/security-setting/authentication', {
        isEnabled: !this.state.isGoogleOAuthEnabled,
        target: 'google',
      });
      this.setState({ isGoogleOAuthEnabled: !this.state.isGoogleOAuthEnabled });
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Switch GithubOAuth enabled
   */
  async switchIsGithubOAuthEnabled() {
    try {
      await this.appContainer.apiv3.put('/security-setting/authentication', {
        isEnabled: !this.state.isGithubOAuthEnabled,
        target: 'github',
      });
      this.setState({ isGithubOAuthEnabled: !this.state.isGithubOAuthEnabled });
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Switch TwitterOAuth enabled
   */
  async switchIsTwitterOAuthEnabled() {
    try {
      await this.appContainer.apiv3.put('/security-setting/authentication', {
        isEnabled: !this.state.isTwitterOAuthEnabled,
        target: 'twitter',
      });
      this.setState({ isTwitterOAuthEnabled: !this.state.isTwitterOAuthEnabled });
    }
    catch (err) {
      toastError(err);
    }
  }


}
