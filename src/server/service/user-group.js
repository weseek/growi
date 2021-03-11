import loggerFactory from '~/utils/logger';

import UserGroupRelation from '~/server/models/user-group-relation';

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
