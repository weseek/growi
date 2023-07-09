import { mock } from 'vitest-mock-extended';

import ExternalUserGroup from '~/features/external-user-group/server/models/external-user-group';
import ExternalUserGroupRelation from '~/features/external-user-group/server/models/external-user-group-relation';
import { configManager } from '~/server/service/config-manager';
import { instanciate } from '~/server/service/external-account';
import PassportService from '~/server/service/passport';

import { ExternalGroupProviderType, ExternalUserGroupTreeNode } from '../../interfaces/external-user-group';

import ExternalUserGroupSyncService from './external-user-group-sync';


// dummy class to implement generateExternalUserGroupTrees which returns test data
class TestExternalUserGroupSyncService extends ExternalUserGroupSyncService {

  constructor() {
    super(ExternalGroupProviderType.ldap, 'ldap');
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

    const rootNode: ExternalUserGroupTreeNode = {
      id: 'cn=rootGroup,ou=groups,dc=example,dc=org',
      userInfos: [{
        id: 'rootGroupUser',
        username: 'rootGroupUser',
        name: 'Root Group User',
        email: 'user@rootgroup.com',
      }],
      childGroupNodes: [],
      name: 'rootGroup',
      description: 'this is a root group',
    };

    return [grandParentNode, rootNode];
  }

}

const testService = new TestExternalUserGroupSyncService();

describe('ExternalUserGroupSyncService.syncExternalUserGroups', () => {
  describe('When autoGenerateUserOnGroupSync is true', () => {
    const configParams = {
      'external-user-group:ldap:autoGenerateUserOnGroupSync': true,
      'external-user-group:ldap:preserveDeletedGroups': false,
    };

    beforeAll(async() => {
      const passportServiceMock = mock<PassportService>();
      passportServiceMock.isSameUsernameTreatedAsIdenticalUser.mockReturnValue(true);
      passportServiceMock.isSameEmailTreatedAsIdenticalUser.mockReturnValue(true);
      instanciate(passportServiceMock);

      await configManager.updateConfigsInTheSameNamespace('crowi', configParams, true);
    });

    it('syncs groups with new users', async() => {
      await testService.syncExternalUserGroups();

      const externalUserGroups = await ExternalUserGroup.find().sort('name');
      console.log(await ExternalUserGroupRelation.find());
      const relation = await ExternalUserGroupRelation.find({ relatedGroup: externalUserGroups[0]._id }).populate('relatedUser');
      console.log(relation);
      expect(externalUserGroups.length).toBe(4);
    });
  });
});
