import { Container } from 'unstated';

import { removeNullPropertyFromObject } from '~/utils/object-utils';
import { toastError } from '../util/apiNotification';

/**
 * Service container for admin security page (SecuritySetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminGeneralSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.dummyCurrentRestrictGuestMode = 0;
    this.dummyCurrentRestrictGuestModeForError = 1;

    this.state = {
      retrieveError: null,
      sessionMaxAge: null,
      wikiMode: '',
      // set dummy value tile for using suspense
      currentRestrictGuestMode: this.dummyCurrentRestrictGuestMode,
      currentPageCompleteDeletionAuthority: 'adminOnly',
      isShowRestrictedByOwner: false,
      isShowRestrictedByGroup: false,
      appSiteUrl: /* appContainer.config.crowi.url || */ '',
      isLocalEnabled: false,
      isLdapEnabled: false,
      isSamlEnabled: false,
      isOidcEnabled: false,
      isBasicEnabled: false,
      isGoogleEnabled: false,
      isGitHubEnabled: false,
      isTwitterEnabled: false,
      setupStrategies: [],
      shareLinks: [],
      totalshareLinks: 0,
      shareLinksPagingLimit: Infinity,
      shareLinksActivePage: 1,
    };

  }

  async retrieveSecurityData() {
    await this.retrieveSetupStratedies();
    const response = await this.appContainer.apiv3.get('/security-setting/');
    const { generalSetting, generalAuth } = response.data.securityParams;
    this.setState({
      currentRestrictGuestMode: generalSetting.restrictGuestMode,
      currentPageCompleteDeletionAuthority: generalSetting.pageCompleteDeletionAuthority,
      isShowRestrictedByOwner: !generalSetting.hideRestrictedByOwner,
      isShowRestrictedByGroup: !generalSetting.hideRestrictedByGroup,
      sessionMaxAge: generalSetting.sessionMaxAge,
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
   * get isWikiModeForced
   * @return {bool} isWikiModeForced
   */
  get isWikiModeForced() {
    return this.state.wikiMode === 'public' || this.state.wikiMode === 'private';
  }

  /**
   * setter for sessionMaxAge
   */
  setSessionMaxAge(sessionMaxAge) {
    this.setState({ sessionMaxAge });
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

  /**
   * Update restrictGuestMode
   * @memberOf AdminGeneralSecuritySContainer
   * @return {string} Appearance
   */
  async updateGeneralSecuritySetting() {

    let requestParams = {
      sessionMaxAge: this.state.sessionMaxAge,
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
   * Retrieve All Sharelinks
   */
  async retrieveShareLinksByPagingNum(page) {

    const params = {
      page,
    };

    const { data } = await this.appContainer.apiv3.get('/security-setting/all-share-links', params);

    if (data.paginateResult == null) {
      throw new Error('data must conclude \'paginateResult\' property.');
    }

    const { docs: shareLinks, totalDocs: totalshareLinks, limit: shareLinksPagingLimit } = data.paginateResult;

    this.setState({
      shareLinks,
      totalshareLinks,
      shareLinksPagingLimit,
      shareLinksActivePage: page,
    });
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
