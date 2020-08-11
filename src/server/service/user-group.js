import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:UserGroupService');

const mongoose = require('mongoose');

const UserGroupRelation = mongoose.model('UserGroupRelation');

/**
 * the service class of UserGroupService
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
