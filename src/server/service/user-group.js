import loggerFactory from '~/utils/logger';

import UserGroup from '~/server/models/user-group';
import UserGroupRelation from '~/server/models/user-group-relation';

const logger = loggerFactory('growi:service:UserGroupService');


/**
 * the service class of UserGroupService
 */
class UserGroupService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  async init() {
    logger.debug('removing all invalid relations');
    return UserGroupRelation.removeAllInvalidRelations();
  }

  async removeCompletelyById(deleteGroupId, action, transferToUserGroupId, user) {
    const deletedGroup = await UserGroup.findByIdAndRemove(deleteGroupId);

    if (deletedGroup == null) {
      logger.debug(`UserGroup data is not exists. id: ${deleteGroupId}`);
      return null;
    }

    await Promise.all([
      UserGroupRelation.removeAllByUserGroup(deletedGroup),
      this.crowi.pageService.handlePrivatePagesForDeletedGroup(deletedGroup, action, transferToUserGroupId, user),
    ]);

    return deletedGroup;
  }

}

module.exports = UserGroupService;
