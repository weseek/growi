import loggerFactory from '~/utils/logger';

const mongoose = require('mongoose');

const UserGroupRelation = mongoose.model('UserGroupRelation');

const logger = loggerFactory('growi:service:UserGroupService');


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
