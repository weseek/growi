const logger = require('@alias/logger')('growi:service:UserGroupService'); // eslint-disable-line no-unused-vars

const mongoose = require('mongoose');

const UserGroupRelation = mongoose.model('UserGroupRelation');

/**
 * the service class of GlobalNotificationSetting
 */
class UserGroupService {

  constructor(configManager) {
    this.configManager = configManager;
  }

  async init() {
    logger.debug('removing all invalid relations');
    return UserGroupRelation.removeAllInvalidRelations();
  }

}

module.exports = UserGroupService;
