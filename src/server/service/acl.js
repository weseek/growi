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
      SECURITY_REGISTRATION_MODE_RESTRICTED: 'Resricted',
      SECURITY_REGISTRATION_MODE_CLOSED: 'Closed',
    };
  }

  getIsPublicWikiOnly() {
    const publicWikiOnly = process.env.PUBLIC_WIKI_ONLY;
    if (publicWikiOnly === 'true' || publicWikiOnly === 1) {
      return true;
    }
    return false;
  }

  getIsGuestAllowedToRead() {
    // return true if puclic wiki mode
    if (this.getIsPublicWikiOnly()) {
      return true;
    }

    // return false if undefined
    const isRestrictGuestMode = this.configManager.getConfig('crowi', 'security:restrictGuestMode');
    if (isRestrictGuestMode) {
      return false;
    }

    return this.labels.SECURITY_RESTRICT_GUEST_MODE_READONLY === isRestrictGuestMode;
  }

  getRestrictGuestModeLabels() {
    const labels = {};
    labels[this.labels.SECURITY_RESTRICT_GUEST_MODE_DENY] = 'security_setting.guest_mode.deny';
    labels[this.labels.SECURITY_RESTRICT_GUEST_MODE_READONLY] = 'security_setting.guest_mode.readonly';

    return labels;
  }

  getRegistrationModeLabels() {
    const labels = {};
    labels[this.labelsSECURITY_REGISTRATION_MODE_OPEN] = 'security_setting.registration_mode.open';
    labels[this.labelsSECURITY_REGISTRATION_MODE_RESTRICTED] = 'security_setting.registration_mode.restricted';
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
