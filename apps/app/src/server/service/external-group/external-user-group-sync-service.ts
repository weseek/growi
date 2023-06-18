import { ExternalGroupProviderType, ExternalUserGroupTreeNode, IExternalUserGroupHasId } from '~/interfaces/external-user-group';
import { IUserHasId } from '~/interfaces/user';
import ExternalUserGroup from '~/server/models/external-user-group';
import ExternalUserGroupRelation from '~/server/models/external-user-group-relation';
import { excludeTestIdsFromTargetIds } from '~/server/util/compare-objectId';

import { configManager } from '../config-manager';

abstract class ExternalUserGroupSyncService {

  provider: ExternalGroupProviderType; // name of external service that contains user group info (e.g: ldap)

  constructor(provider: ExternalGroupProviderType) {
    this.provider = provider;
  }

  /** External user group tree sync method
   * 1. Generate external user group tree
   * 2. Use createUpdateExternalUserGroup on each node in the tree using DFS
   * 3. If preserveDeletedLDAPGroups is false、delete all ExternalUserGroups that were not found during tree search
  */
  async syncExternalUserGroups(): Promise<void> {
    const trees = await this.generateExternalUserGroupTrees();

    const existingExternalUserGroupIds: string[] = [];

    const syncNode = async(node: ExternalUserGroupTreeNode, parentId?: string) => {
      const externalUserGroup = await this.createUpdateExternalUserGroup(node, parentId);
      existingExternalUserGroupIds.push(externalUserGroup._id);
      node.childGroupNodes.forEach((childNode) => {
        syncNode(childNode, externalUserGroup._id);
      });
    };

    await Promise.all(trees.map((root) => {
      return syncNode(root);
    }));

    const preserveDeletedLdapGroups: boolean = configManager?.getConfig('crowi', `external-user-group:${this.provider}:preserveDeletedGroups`);
    if (!preserveDeletedLdapGroups) {
      await ExternalUserGroup.deleteMany({ _id: { $nin: existingExternalUserGroupIds }, provider: this.provider });
    }
  }

  /** External user group node sync method
   * 1. Create/Update ExternalUserGroup from using information of ExternalUserGroupTreeNode
   * 2. For every element in node.users, call getMemberUser and create an ExternalUserGroupRelation with ExternalUserGroup if it does not have one
   * 3. Retrun ExternalUserGroup
   * @param {string} node Node of external group tree
   * @param {string} parentId Parent group id (id in GROWI) of the group we wan't to create/update
   * @returns {Promise<IExternalUserGroupHasId>} ExternalUserGroup that was created/updated
  */
  async createUpdateExternalUserGroup(node: ExternalUserGroupTreeNode, parentId?: string): Promise<IExternalUserGroupHasId> {
    const externalUserGroup = await ExternalUserGroup.findAndUpdateOrCreateGroup(
      node.name, node.description, node.id, this.provider, parentId,
    );
    await Promise.all(node.externalUserIds.map((externalUserId) => {
      return (async() => {
        const user = await this.getMemberUser(externalUserId);

        if (user != null) {
          const userGroups = await ExternalUserGroup.findGroupsWithAncestorsRecursively(externalUserGroup);
          const userGroupIds = userGroups.map(g => g._id);

          // remove existing relations from list to create
          const existingRelations = await ExternalUserGroupRelation.find({ relatedGroup: { $in: userGroupIds }, relatedUser: user._id });
          const existingGroupIds = existingRelations.map(r => r.relatedGroup);
          const groupIdsToCreateRelation = excludeTestIdsFromTargetIds(userGroupIds, existingGroupIds);

          await ExternalUserGroupRelation.createRelations(groupIdsToCreateRelation, user);
        }
      })();
    }));

    return externalUserGroup;
  }

  /** Method to get group member GROWI user
   * 1. Execute search on external app/server for user info using externalUserId
   * 2. Search for GROWI user based on user info of 1, and return user
   *   - if autoGenerateUserOnHogeGroupSync is true and GROWI user is not found, create new GROWI user
   * @param {string} externalUserId Search LDAP server using this identifier (DN or UID)
   * @returns {Promise<IUserHasId | null>} User when found or created, null when neither
   */
  abstract getMemberUser(externalUserId: string): Promise<IUserHasId | null>

  /** Method to generate external group tree structure
   * 1. Fetch user group info from external app/server
   * 2. Convert each group tree structure to ExternalUserGroupTreeNode
   * 3. Return the root node of each tree
  */
  abstract generateExternalUserGroupTrees(): Promise<ExternalUserGroupTreeNode[]>;

}

export default ExternalUserGroupSyncService;
