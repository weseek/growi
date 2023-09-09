import { GroupRepresentation, KeycloakAdminClient, UserRepresentation } from '@s3pweb/keycloak-admin-client-cjs';

import { configManager } from '~/server/service/config-manager';
import { batchProcessPromiseAll } from '~/utils/promise';

import { ExternalGroupProviderType, ExternalUserGroupTreeNode, ExternalUserInfo } from '../../interfaces/external-user-group';

import ExternalUserGroupSyncService from './external-user-group-sync';

// When d = max depth of group trees
// Max space complexity of generateExternalUserGroupTrees will be:
// O(TREES_BATCH_SIZE * d)
const TREES_BATCH_SIZE = 10;

class KeycloakUserGroupSyncService extends ExternalUserGroupSyncService {

  kcAdminClient: KeycloakAdminClient;

  realm: string;

  groupDescriptionAttribute: string;

  constructor() {
    const keycloakHost = configManager?.getConfig('crowi', 'external-user-group:keycloak:host');
    const keycloakRealm = configManager?.getConfig('crowi', 'external-user-group:keycloak:realm');
    const keycloakGroupDescriptionAttribute = configManager?.getConfig('crowi', 'external-user-group:keycloak:groupDescriptionAttribute');
    // TODO: allow user to choose 'oidc' or 'saml' for keycloak in settings
    super(ExternalGroupProviderType.ldap, 'oidc');
    this.kcAdminClient = new KeycloakAdminClient({ baseUrl: keycloakHost });
    this.realm = keycloakRealm;
    this.groupDescriptionAttribute = keycloakGroupDescriptionAttribute;
  }

  async auth(): Promise<void> {
    const keycloakGroupSyncClientName = configManager?.getConfig('crowi', 'external-user-group:keycloak:groupSyncClientName');
    const keycloakGroupSyncClientID: string = configManager.getConfig('crowi', 'external-user-group:keycloak:groupSyncClientID');
    const keycloakGroupSyncClientSecret: string = configManager.getConfig('crowi', 'external-user-group:keycloak:groupSyncClientSecret');

    await this.kcAdminClient.auth({
      // grantType: 'client_credentials',
      // clientId: keycloakGroupSyncClientID,
      // clientSecret: keycloakGroupSyncClientSecret,
      grantType: 'password',
      username: 'admin',
      password: 'admin',
      clientId: keycloakGroupSyncClientID,
    });
  }

  async generateExternalUserGroupTrees(): Promise<ExternalUserGroupTreeNode[]> {
    // Type is 'GroupRepresentation', but 'find' does not return 'attributes' field. Hence, attribute for description is not present.
    const rootGroups = await this.kcAdminClient.groups.find({ realm: this.realm });

    return (await batchProcessPromiseAll(rootGroups, TREES_BATCH_SIZE, group => this.groupRepresentationToTreeNode(group)))
      .filter((node): node is NonNullable<ExternalUserGroupTreeNode> => node != null);
  }

  private async groupRepresentationToTreeNode(group: GroupRepresentation): Promise<ExternalUserGroupTreeNode | null> {
    if (group.id == null || group.name == null) return null;

    const userRepresentations = await this.kcAdminClient.groups.listMembers({ id: group.id, realm: this.realm });

    const userInfos = userRepresentations != null ? this.userRepresentationsToExternalUserInfos(userRepresentations) : [];
    const description = await this.getGroupDescription(group.id) || undefined;
    const childGroups = group.subGroups;

    const childGroupNodesWithNull: (ExternalUserGroupTreeNode | null)[] = [];
    if (childGroups != null) {
      // Do not use Promise.all, because the number of promises processed can
      // exponentially grow when group tree is enormous
      for await (const childGroup of childGroups) {
        childGroupNodesWithNull.push(await this.groupRepresentationToTreeNode(childGroup));
      }
    }
    const childGroupNodes: ExternalUserGroupTreeNode[] = childGroupNodesWithNull
      .filter((node): node is NonNullable<ExternalUserGroupTreeNode> => node != null);

    return {
      id: group.id,
      userInfos,
      childGroupNodes,
      name: group.name,
      description,
    };
  }

  private async getGroupDescription(groupId: string): Promise<string | null> {
    if (this.groupDescriptionAttribute == null) return null;

    const groupDetail = await this.kcAdminClient.groups.findOne({ id: groupId, realm: this.realm });

    const description = groupDetail?.attributes?.[this.groupDescriptionAttribute];
    return typeof description === 'string' ? description : null;
  }

  private userRepresentationsToExternalUserInfos(userRepresentations: UserRepresentation[]): ExternalUserInfo[] {
    const externalUserGroupsWithNull: (ExternalUserInfo | null)[] = userRepresentations.map((userRepresentation) => {
      if (userRepresentation.id != null && userRepresentation.username != null) {
        return {
          id: userRepresentation.id,
          username: userRepresentation.username,
          email: userRepresentation.email,
        };
      }
      return null;
    });

    return externalUserGroupsWithNull.filter((node): node is NonNullable<ExternalUserInfo> => node != null);
  }

}

export default KeycloakUserGroupSyncService;
