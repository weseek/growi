import type { IUserHasId } from '@growi/core';

import { SocketEventName } from '~/interfaces/websocket';
import ExternalAccount from '~/server/models/external-account';
import { excludeTestIdsFromTargetIds } from '~/server/util/compare-objectId';
import loggerFactory from '~/utils/logger';
import { batchProcessPromiseAll } from '~/utils/promise';

import { configManager } from '../../../../server/service/config-manager';
import { externalAccountService } from '../../../../server/service/external-account';
import {
  ExternalGroupProviderType, ExternalUserGroupTreeNode, ExternalUserInfo, IExternalUserGroupHasId,
} from '../../interfaces/external-user-group';
import ExternalUserGroup from '../models/external-user-group';
import ExternalUserGroupRelation from '../models/external-user-group-relation';

const logger = loggerFactory('growi:service:external-user-group-sync-service');

// When d = max depth of group trees
// Max space complexity of syncExternalUserGroups will be:
// O(TREES_BATCH_SIZE * d * USERS_BATCH_SIZE)
const TREES_BATCH_SIZE = 10;
const USERS_BATCH_SIZE = 30;

// SyncParamsType: type of params to propagate and use on executing syncExternalUserGroups
abstract class ExternalUserGroupSyncService<SyncParamsType = any> {

  groupProviderType: ExternalGroupProviderType; // name of external service that contains user group info (e.g: ldap, keycloak)

  authProviderType: string | null; // auth provider type (e.g: ldap, oidc) has to be set before syncExternalUserGroups execution

  socketIoService: any;

  isExecutingSync = false;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(groupProviderType: ExternalGroupProviderType, socketIoService) {
    this.groupProviderType = groupProviderType;
    this.socketIoService = socketIoService;
  }

  /** External user group tree sync method
   * 1. Generate external user group tree
   * 2. Use createUpdateExternalUserGroup on each node in the tree using DFS
   * 3. If preserveDeletedLDAPGroups is false、delete all ExternalUserGroups that were not found during tree search
  */
  async syncExternalUserGroups(params?: SyncParamsType): Promise<void> {
    if (this.authProviderType == null) throw new Error('auth provider type is not set');
    if (this.isExecutingSync) throw new Error('External user group sync is already being executed');
    this.isExecutingSync = true;

    const preserveDeletedLdapGroups: boolean = configManager?.getConfig('crowi', `external-user-group:${this.groupProviderType}:preserveDeletedGroups`);
    const existingExternalUserGroupIds: string[] = [];

    const socket = this.socketIoService?.getAdminSocket();

    try {
      const trees = await this.generateExternalUserGroupTrees(params);
      const totalCount = trees.map(tree => this.getGroupCountOfTree(tree))
        .reduce((sum, current) => sum + current);
      let count = 0;

      const syncNode = async(node: ExternalUserGroupTreeNode, parentId?: string) => {
        const externalUserGroup = await this.createUpdateExternalUserGroup(node, parentId);
        existingExternalUserGroupIds.push(externalUserGroup._id);
        count++;
        socket?.emit(SocketEventName.externalUserGroup[this.groupProviderType].GroupSyncProgress, { totalCount, count });
        // Do not use Promise.all, because the number of promises processed can
        // exponentially grow when group tree is enormous
        for await (const childNode of node.childGroupNodes) {
          await syncNode(childNode, externalUserGroup._id);
        }
      };

      await batchProcessPromiseAll(trees, TREES_BATCH_SIZE, async(tree) => {
        return syncNode(tree);
      });

      if (!preserveDeletedLdapGroups) {
        await ExternalUserGroup.deleteMany({ _id: { $nin: existingExternalUserGroupIds }, groupProviderType: this.groupProviderType });
        await ExternalUserGroupRelation.removeAllInvalidRelations();
      }
      socket?.emit(SocketEventName.externalUserGroup[this.groupProviderType].GroupSyncCompleted);
    }
    catch (e) {
      logger.error(e.message);
      socket?.emit(SocketEventName.externalUserGroup[this.groupProviderType].GroupSyncFailed);
    }
    finally {
      this.isExecutingSync = false;
    }
  }

  /** External user group node sync method
   * 1. Create/Update ExternalUserGroup from using information of ExternalUserGroupTreeNode
   * 2. For every element in node.userInfos, call getMemberUser and create an ExternalUserGroupRelation with ExternalUserGroup if it does not have one
   * 3. Retrun ExternalUserGroup
   * @param {string} node Node of external group tree
   * @param {string} parentId Parent group id (id in GROWI) of the group we want to create/update
   * @returns {Promise<IExternalUserGroupHasId>} ExternalUserGroup that was created/updated
  */
  private async createUpdateExternalUserGroup(node: ExternalUserGroupTreeNode, parentId?: string): Promise<IExternalUserGroupHasId> {
    const externalUserGroup = await ExternalUserGroup.findAndUpdateOrCreateGroup(
      node.name, node.id, this.groupProviderType, node.description, parentId,
    );
    await batchProcessPromiseAll(node.userInfos, USERS_BATCH_SIZE, async(userInfo) => {
      const user = await this.getMemberUser(userInfo);

      if (user != null) {
        const userGroups = await ExternalUserGroup.findGroupsWithAncestorsRecursively(externalUserGroup);
        const userGroupIds = userGroups.map(g => g._id);

        // remove existing relations from list to create
        const existingRelations = await ExternalUserGroupRelation.find({ relatedGroup: { $in: userGroupIds }, relatedUser: user._id });
        const existingGroupIds = existingRelations.map(r => r.relatedGroup.toString());
        const groupIdsToCreateRelation = excludeTestIdsFromTargetIds(userGroupIds, existingGroupIds);

        await ExternalUserGroupRelation.createRelations(groupIdsToCreateRelation, user);
      }
    });

    return externalUserGroup;
  }

  /** Method to get group member GROWI user
   * 1. Search for GROWI user based on user info of 1, and return user
   * 2. If autoGenerateUserOnHogeGroupSync is true and GROWI user is not found, create new GROWI user
   * @param {ExternalUserInfo} externalUserInfo Search external app/server using this identifier
   * @returns {Promise<IUserHasId | null>} User when found or created, null when neither
   */
  private async getMemberUser(userInfo: ExternalUserInfo): Promise<IUserHasId | null> {
    const authProviderType = this.authProviderType;
    if (authProviderType == null) throw new Error('auth provider type is not set');

    const autoGenerateUserOnGroupSync = configManager?.getConfig('crowi', `external-user-group:${this.groupProviderType}:autoGenerateUserOnGroupSync`);

    const getExternalAccount = async() => {
      if (autoGenerateUserOnGroupSync && externalAccountService != null) {
        return externalAccountService.getOrCreateUser({
          id: userInfo.id, username: userInfo.username, name: userInfo.name, email: userInfo.email,
        }, authProviderType);
      }
      return ExternalAccount.findOne({ providerType: this.groupProviderType, accountId: userInfo.id });
    };

    const externalAccount = await getExternalAccount();

    if (externalAccount != null) {
      return (await externalAccount.populate<{user: IUserHasId | null}>('user')).user;
    }
    return null;
  }

  getGroupCountOfTree(tree: ExternalUserGroupTreeNode): number {
    if (tree.childGroupNodes.length === 0) return 1;

    let count = 1;
    tree.childGroupNodes.forEach((childGroup) => {
      count += this.getGroupCountOfTree(childGroup);
    });
    return count;
  }

  /** Method to generate external group tree structure
   * 1. Fetch user group info from external app/server
   * 2. Convert each group tree structure to ExternalUserGroupTreeNode
   * 3. Return the root node of each tree
  */
  abstract generateExternalUserGroupTrees(params?: SyncParamsType): Promise<ExternalUserGroupTreeNode[]>

}

export default ExternalUserGroupSyncService;
