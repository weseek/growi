import type { IUserHasId } from '@growi/core';
import mongoose, { Types } from 'mongoose';

import {
  ExternalGroupProviderType, ExternalUserGroupTreeNode, IExternalUserGroup, IExternalUserGroupHasId,
} from '../../../src/features/external-user-group/interfaces/external-user-group';
import ExternalUserGroup from '../../../src/features/external-user-group/server/models/external-user-group';
import ExternalUserGroupRelation from '../../../src/features/external-user-group/server/models/external-user-group-relation';
import ExternalUserGroupSyncService from '../../../src/features/external-user-group/server/service/external-user-group-sync';
import ExternalAccount from '../../../src/server/models/external-account';
import { configManager } from '../../../src/server/service/config-manager';
import { instanciate } from '../../../src/server/service/external-account';
import PassportService from '../../../src/server/service/passport';
import { getInstance } from '../setup-crowi';

// dummy class to implement generateExternalUserGroupTrees which returns test data
class TestExternalUserGroupSyncService extends ExternalUserGroupSyncService {

  constructor(socketIoService) {
    super(ExternalGroupProviderType.ldap, 'ldap', socketIoService);
  }

  async generateExternalUserGroupTrees(): Promise<ExternalUserGroupTreeNode[]> {
    const childNode: ExternalUserGroupTreeNode = {
      id: 'cn=childGroup,ou=groups,dc=example,dc=org',
      userInfos: [{
        id: 'childGroupUser',
        username: 'childGroupUser',
        name: 'Child Group User',
        email: 'user@childgroup.com',
      }],
      childGroupNodes: [],
      name: 'childGroup',
      description: 'this is a child group',
    };
    const parentNode: ExternalUserGroupTreeNode = {
      id: 'cn=parentGroup,ou=groups,dc=example,dc=org',
      // name is undefined
      userInfos: [{
        id: 'parentGroupUser',
        username: 'parentGroupUser',
        email: 'user@parentgroup.com',
      }],
      childGroupNodes: [childNode],
      name: 'parentGroup',
      description: 'this is a parent group',
    };
    const grandParentNode: ExternalUserGroupTreeNode = {
      id: 'cn=grandParentGroup,ou=groups,dc=example,dc=org',
      // email is undefined
      userInfos: [{
        id: 'grandParentGroupUser',
        username: 'grandParentGroupUser',
        name: 'Grand Parent Group User',
      }],
      childGroupNodes: [parentNode],
      name: 'grandParentGroup',
      description: 'this is a grand parent group',
    };

    const previouslySyncedNode: ExternalUserGroupTreeNode = {
      id: 'cn=previouslySyncedGroup,ou=groups,dc=example,dc=org',
      userInfos: [{
        id: 'previouslySyncedGroupUser',
        username: 'previouslySyncedGroupUser',
        name: 'Root Group User',
        email: 'user@previouslySyncedgroup.com',
      }],
      childGroupNodes: [],
      name: 'previouslySyncedGroup',
      description: 'this is a previouslySynced group',
    };

    return [grandParentNode, previouslySyncedNode];
  }

}

const testService = new TestExternalUserGroupSyncService(null);

const checkGroup = (group: IExternalUserGroupHasId, expected: Omit<IExternalUserGroup, 'createdAt'>) => {
  const actual = {
    name: group.name,
    parent: group.parent,
    description: group.description,
    externalId: group.externalId,
    provider: group.provider,
  };
  expect(actual).toStrictEqual(expected);
};

const checkSync = async(autoGenerateUserOnGroupSync = true) => {
  const grandParentGroup = await ExternalUserGroup.findOne({ name: 'grandParentGroup' });
  checkGroup(grandParentGroup, {
    externalId: 'cn=grandParentGroup,ou=groups,dc=example,dc=org',
    name: 'grandParentGroup',
    description: 'this is a grand parent group',
    provider: 'ldap',
    parent: null,
  });
  const grandParentGroupRelations = await ExternalUserGroupRelation
    .find({ relatedGroup: grandParentGroup._id });
  if (autoGenerateUserOnGroupSync) {
    expect(grandParentGroupRelations.length).toBe(3);
    const grandParentGroupUser = (await grandParentGroupRelations[0].populate<{relatedUser: IUserHasId}>('relatedUser'))?.relatedUser;
    expect(grandParentGroupUser?.username).toBe('grandParentGroupUser');
    const parentGroupUser = (await grandParentGroupRelations[1].populate<{relatedUser: IUserHasId}>('relatedUser'))?.relatedUser;
    expect(parentGroupUser?.username).toBe('parentGroupUser');
    const childGroupUser = (await grandParentGroupRelations[2].populate<{relatedUser: IUserHasId}>('relatedUser'))?.relatedUser;
    expect(childGroupUser?.username).toBe('childGroupUser');
  }
  else {
    expect(grandParentGroupRelations.length).toBe(0);
  }

  const parentGroup = await ExternalUserGroup.findOne({ name: 'parentGroup' });
  checkGroup(parentGroup, {
    externalId: 'cn=parentGroup,ou=groups,dc=example,dc=org',
    name: 'parentGroup',
    description: 'this is a parent group',
    provider: 'ldap',
    parent: grandParentGroup._id,
  });
  const parentGroupRelations = await ExternalUserGroupRelation
    .find({ relatedGroup: parentGroup._id });
  if (autoGenerateUserOnGroupSync) {
    expect(parentGroupRelations.length).toBe(2);
    const parentGroupUser = (await parentGroupRelations[0].populate<{relatedUser: IUserHasId}>('relatedUser'))?.relatedUser;
    expect(parentGroupUser?.username).toBe('parentGroupUser');
    const childGroupUser = (await parentGroupRelations[1].populate<{relatedUser: IUserHasId}>('relatedUser'))?.relatedUser;
    expect(childGroupUser?.username).toBe('childGroupUser');
  }
  else {
    expect(parentGroupRelations.length).toBe(0);
  }

  const childGroup = await ExternalUserGroup.findOne({ name: 'childGroup' });
  checkGroup(childGroup, {
    externalId: 'cn=childGroup,ou=groups,dc=example,dc=org',
    name: 'childGroup',
    description: 'this is a child group',
    provider: 'ldap',
    parent: parentGroup._id,
  });
  const childGroupRelations = await ExternalUserGroupRelation
    .find({ relatedGroup: childGroup._id });
  if (autoGenerateUserOnGroupSync) {
    expect(childGroupRelations.length).toBe(1);
    const childGroupUser = (await childGroupRelations[0].populate<{relatedUser: IUserHasId}>('relatedUser'))?.relatedUser;
    expect(childGroupUser?.username).toBe('childGroupUser');
  }
  else {
    expect(childGroupRelations.length).toBe(0);
  }

  const previouslySyncedGroup = await ExternalUserGroup.findOne({ name: 'previouslySyncedGroup' });
  checkGroup(previouslySyncedGroup, {
    externalId: 'cn=previouslySyncedGroup,ou=groups,dc=example,dc=org',
    name: 'previouslySyncedGroup',
    description: 'this is a previouslySynced group',
    provider: 'ldap',
    parent: null,
  });
  const previouslySyncedGroupRelations = await ExternalUserGroupRelation
    .find({ relatedGroup: previouslySyncedGroup._id });
  if (autoGenerateUserOnGroupSync) {
    expect(previouslySyncedGroupRelations.length).toBe(1);
    const previouslySyncedGroupUser = (await previouslySyncedGroupRelations[0].populate<{relatedUser: IUserHasId}>('relatedUser'))?.relatedUser;
    expect(previouslySyncedGroupUser?.username).toBe('previouslySyncedGroupUser');
  }
  else {
    expect(previouslySyncedGroupRelations.length).toBe(0);
  }
};

describe('ExternalUserGroupSyncService.syncExternalUserGroups', () => {
  let crowi;

  beforeAll(async() => {
    crowi = await getInstance();
    const passportService = new PassportService(crowi);
    instanciate(passportService);
  });

  beforeEach(async() => {
    await ExternalUserGroup.create({
      name: 'nameBeforeEdit',
      description: 'this is a description before edit',
      externalId: 'cn=previouslySyncedGroup,ou=groups,dc=example,dc=org',
      provider: 'ldap',
    });
  });

  afterEach(async() => {
    await ExternalUserGroup.deleteMany();
    await ExternalUserGroupRelation.deleteMany();
    await mongoose.model('User')
      .deleteMany({ username: { $in: ['childGroupUser', 'parentGroupUser', 'grandParentGroupUser', 'previouslySyncedGroupUser'] } });
    await ExternalAccount.deleteMany({ accountId: { $in: ['childGroupUser', 'parentGroupUser', 'grandParentGroupUser', 'previouslySyncedGroupUser'] } });
  });

  describe('When autoGenerateUserOnGroupSync is true', () => {
    const configParams = {
      'external-user-group:ldap:autoGenerateUserOnGroupSync': true,
      'external-user-group:ldap:preserveDeletedGroups': false,
    };

    beforeAll(async() => {
      await configManager.updateConfigsInTheSameNamespace('crowi', configParams, true);
    });

    // eslint-disable-next-line jest/expect-expect
    it('syncs groups with new users', async() => {
      await testService.syncExternalUserGroups();
      await checkSync();
    });
  });

  describe('When autoGenerateUserOnGroupSync is false', () => {
    const configParams = {
      'external-user-group:ldap:autoGenerateUserOnGroupSync': false,
      'external-user-group:ldap:preserveDeletedGroups': true,
    };

    beforeAll(async() => {
      await configManager.updateConfigsInTheSameNamespace('crowi', configParams, true);
    });

    // eslint-disable-next-line jest/expect-expect
    it('syncs groups without new users', async() => {
      await testService.syncExternalUserGroups();
      await checkSync(false);
    });
  });

  describe('When preserveDeletedGroups is false', () => {
    const configParams = {
      'external-user-group:ldap:autoGenerateUserOnGroupSync': true,
      'external-user-group:ldap:preserveDeletedGroups': false,
    };

    beforeAll(async() => {
      await configManager.updateConfigsInTheSameNamespace('crowi', configParams, true);

      const groupId = new Types.ObjectId();
      const userId = new Types.ObjectId();

      await ExternalUserGroup.create({
        _id: groupId,
        name: 'non existent group',
        externalId: 'cn=nonExistentGroup,ou=groups,dc=example,dc=org',
        provider: 'ldap',
      });
      await mongoose.model('User').create({ _id: userId, username: 'nonExistentGroupUser' });
      await ExternalUserGroupRelation.create({ relatedUser: userId, relatedGroup: groupId });
    });

    it('syncs groups and deletes groups that do not exist externally', async() => {
      await testService.syncExternalUserGroups();
      await checkSync();
      expect(await ExternalUserGroup.countDocuments()).toBe(4);
      expect(await ExternalUserGroupRelation.countDocuments()).toBe(7);
    });
  });
});
