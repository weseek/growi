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
      currentRestrictGuestMode: appContainer.config.restrictGuestMode,
      currentpageCompleteDeletionAuthority: appContainer.config.pageCompleteDeletionAuthority,
      hideRestrictedByOwner: appContainer.config.hideRestrictedByOwner,
      hideRestrictedByGroup: appContainer.config.hideRestrictedByGroup,
    };

    this.init();

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminSecrityContainer';
  }

  /**
   * retrieve security data
   */
  async init() {
    // TODO GW-583 init state by apiv3
  }


  /**
   * Switch restrictGuestMode
   */
  switchRestrictGuestMode(restrictGuestModeLabel) {
    this.setState({ currentRestrictGuestMode: restrictGuestModeLabel });
  }

  /**
   * Switch pageCompleteDeletionAuthority
   */
  switchPageCompleteDeletionAuthority(pageCompleteDeletionAuthorityLabel) {
    this.setState({ currentpageCompleteDeletionAuthority: pageCompleteDeletionAuthorityLabel });
  }

  /**
   * Switch hideRestrictedByOwner
   */
  switchHideRestrictedByOwner() {
    this.setState({ hideRestrictedByOwner:  !this.state.hideRestrictedByOwner });
  }

  /**
   * Switch hideRestrictedByGroup
   */
  switchHideRestrictedByGroup() {
    this.setState({ hideRestrictedByGroup:  !this.state.hideRestrictedByGroup });
  }

  /**
   * Update restrictGuestMode
   * @memberOf AdminSecuritySettingContainer
   * @return {string} Appearance
   */
  async updateRestrictGuestMode() {
    const response = await this.appContainer.apiv3.put('/security-setting/guestMode', {
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
    const response = await this.appContainer.apiv3.put('/security-setting/pageDeletion', {
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
