const logger = require('@alias/logger')('growi:service:AclService'); // eslint-disable-line no-unused-vars

// const SECURITY_RESTRICT_GUEST_MODE_DENY = 'Deny';
const SECURITY_RESTRICT_GUEST_MODE_READONLY = 'Readonly';
// const SECURITY_REGISTRATION_MODE_OPEN = 'Open';
// const SECURITY_REGISTRATION_MODE_RESTRICTED = 'Resricted';
// const SECURITY_REGISTRATION_MODE_CLOSED = 'Closed';

/**
 * the service class of AclService
 */
class AclService {

  constructor(configManager) {
    this.configManager = configManager;
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

    return SECURITY_RESTRICT_GUEST_MODE_READONLY === isRestrictGuestMode;
  }

}

module.exports = AclService;
