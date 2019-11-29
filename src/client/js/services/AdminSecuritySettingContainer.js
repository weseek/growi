import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:AdminSecuritySettingContainer');

/**
 * Service container for admin security setting page (SecuritySetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminSecuritySettingContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      // TODO GW-583 set Data from apiv3
      isWikiModeForced: false,
      currentRestrictGuestMode: 'deny',
      currentpageCompleteDeletionAuthority: 'anyone',
      isHideRestrictedByOwner: true,
      isHideRestrictedByGroup: true,
    };

    this.init();


    this.changeRestrictGuestMode = this.changeRestrictGuestMode.bind(this);
    this.switchIsHideRestrictedByGroup = this.switchIsHideRestrictedByGroup.bind(this);
    this.switchIsHideRestrictedByOwner = this.switchIsHideRestrictedByOwner.bind(this);
    this.changePageCompleteDeletionAuthority = this.changePageCompleteDeletionAuthority.bind(this);
  }

  /**
   * retrieve security data
   */
  async init() {
    // TODO GW-583 init state by apiv3
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
   * @memberOf AdminSecuritySettingContainer
   * @return {string} Appearance
   */
  async updateRestrictGuestMode() {
    const response = await this.appContainer.apiv3.put('/security-setting/guest-mode', {
      restrictGuestMode: this.state.currentRestrictGuestMode,
    });
    const { securitySettingParams } = response.data;
    return securitySettingParams;
  }

  /**
   * Update pageDeletion
   * @memberOf AdminSecuritySettingContainer
   * @return {string} pageDeletion
   */
  async updatePageCompleteDeletionAuthority() {
    const response = await this.appContainer.apiv3.put('/security-setting/page-deletion', {
      pageCompleteDeletionAuthority: this.state.currentPageCompleteDeletionAuthority,
    });
    const { securitySettingParams } = response.data;
    return securitySettingParams;
  }

  /**
   * Update function
   * @memberOf AdminSecucitySettingContainer
   * @return {string} Functions
   */
  async updateSecurityFunction() {
    const response = await this.appContainer.apiv3.put('/security-setting/function', {
      hideRestrictedByGroup: this.state.hideRestrictedByGroup,
      hideRestrictedByOwner: this.state.hideRestrictedByOwner,
    });
    const { securitySettingParams } = response.data;
    return securitySettingParams;
  }

}
