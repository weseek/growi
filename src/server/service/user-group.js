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

  async removeCompletelyById(deleteGroupId, action, transferToUserGroupId) {
    const groupToDelete = await UserGroup.findById(deleteGroupId);
    if (groupToDelete == null) {
      throw new Error(`UserGroup data is not exists. id: ${deleteGroupId}`);
    }
    const deletedGroup = await groupToDelete.remove();

    await Promise.all([
      UserGroupRelation.removeAllByUserGroup(deletedGroup),
      this.crowi.pageService.handlePrivatePagesForDeletedGroup(deletedGroup, action, transferToUserGroupId),
    ]);

    return deletedGroup;
  }

}

module.exports = UserGroupService;
