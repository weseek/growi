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

  isAclEnabled() {
    const isPublicWikiOnly = this.configManager.getConfig('crowi', 'security:isPublicWikiOnly');
    const isPrivateWikiOnly = this.configManager.getConfig('crowi', 'security:isPrivateWikiOnly');

    return !(isPublicWikiOnly || isPrivateWikiOnly);
  }

  getIsGuestAllowedToRead() {
    const isPublicWikiOnly = this.configManager.getConfig('crowi', 'security:isPublicWikiOnly');
    const isPrivateWikiOnly = this.configManager.getConfig('crowi', 'security:isPrivateWikiOnly');

    // return false if private wiki mode
    if (isPrivateWikiOnly) {
      return false;
    }
    // return true if puclic wiki mode
    if (isPublicWikiOnly) {
      return true;
    }

    const guestMode = this.configManager.getConfig('crowi', 'security:restrictGuestMode');

    // 'Readonly' => returns true (allow access to guests)
    // 'Deny', null, undefined, '', ... everything else => returns false (requires login)
    return guestMode === this.labels.SECURITY_RESTRICT_GUEST_MODE_READONLY;
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
