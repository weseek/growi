const logger = require('@alias/logger')('growi:service:AclService'); // eslint-disable-line no-unused-vars

/**
 * the service class of AclService
 */
class AclService {

  constructor(configManager) {
    this.configManager = configManager;
    this.labels = {
      SECURITY_RESTRICT_GUEST_MODE_DENY: 'Deny',
      SECURITY_RESTRICT_GUEST_MODE_READONLY: 'Readonly',
      SECURITY_REGISTRATION_MODE_OPEN: 'Open',
      SECURITY_REGISTRATION_MODE_RESTRICTED: 'Restricted',
      SECURITY_REGISTRATION_MODE_CLOSED: 'Closed',
    };
  }

  /**
   * @returns Whether Access Control is enabled or not
   */
  isAclEnabled() {
    const wikiMode = this.configManager.getConfig('crowi', 'security:wikiMode');
    return wikiMode !== 'public';
  }

  /**
   * @returns Whether wiki mode is set
   */
  isWikiModeForced() {
    const wikiMode = this.configManager.getConfig('crowi', 'security:wikiMode');
    const isPrivateOrPublic = wikiMode === 'private' || wikiMode === 'public';

    return isPrivateOrPublic;
  }

  /**
   * @returns Whether guest users are allowed to read public pages
   */
  isGuestAllowedToRead() {
    const wikiMode = this.configManager.getConfig('crowi', 'security:wikiMode');

    // return false if private wiki mode
    if (wikiMode === 'private') {
      return false;
    }
    // return true if public wiki mode
    if (wikiMode === 'public') {
      return true;
    }

    const guestMode = this.configManager.getConfig('crowi', 'security:restrictGuestMode');

    // 'Readonly' => returns true (allow access to guests)
    // 'Deny', null, undefined, '', ... everything else => returns false (requires login)
    return guestMode === this.labels.SECURITY_RESTRICT_GUEST_MODE_READONLY;
  }

  getGuestModeValue() {
    return this.isGuestAllowedToRead()
      ? this.labels.SECURITY_RESTRICT_GUEST_MODE_READONLY
      : this.labels.SECURITY_RESTRICT_GUEST_MODE_DENY;
  }

  getRestrictGuestModeLabels() {
    const labels = {};
    labels[this.labels.SECURITY_RESTRICT_GUEST_MODE_DENY] = 'security_setting.guest_mode.deny';
    labels[this.labels.SECURITY_RESTRICT_GUEST_MODE_READONLY] = 'security_setting.guest_mode.readonly';

    return labels;
  }

  getRegistrationModeLabels() {
    const labels = {};
    labels[this.labels.SECURITY_REGISTRATION_MODE_OPEN] = 'security_setting.registration_mode.open';
    labels[this.labels.SECURITY_REGISTRATION_MODE_RESTRICTED] = 'security_setting.registration_mode.restricted';
    labels[this.labels.SECURITY_REGISTRATION_MODE_CLOSED] = 'security_setting.registration_mode.closed';

    return labels;
  }

  userUpperLimit() {
    // const limit = this.configManager.getConfig('crowi', 'USER_UPPER_LIMIT');
    const limit = process.env.USER_UPPER_LIMIT;

    if (limit) {
      return Number(limit);
    }

    return 0;
  }

}

module.exports = AclService;
