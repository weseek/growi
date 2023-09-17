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

  realm: string; // realm that contains the groups

  groupDescriptionAttribute: string; // attribute to map to group description

  constructor(socketIoService) {
    const kcHost = configManager?.getConfig('crowi', 'external-user-group:keycloak:host');
    const kcGroupRealm = configManager?.getConfig('crowi', 'external-user-group:keycloak:groupRealm');
    const kcGroupSyncClientRealm = configManager?.getConfig('crowi', 'external-user-group:keycloak:groupSyncClientRealm');
    const kcGroupDescriptionAttribute = configManager?.getConfig('crowi', 'external-user-group:keycloak:groupDescriptionAttribute');

    super(ExternalGroupProviderType.keycloak, socketIoService);
    this.kcAdminClient = new KeycloakAdminClient({ baseUrl: kcHost, realmName: kcGroupSyncClientRealm });
    this.realm = kcGroupRealm;
    this.groupDescriptionAttribute = kcGroupDescriptionAttribute;
  }

  override syncExternalUserGroups(authProviderType: 'oidc' | 'saml'): Promise<void> {
    this.authProviderType = authProviderType;
    return super.syncExternalUserGroups();
  }

  override async generateExternalUserGroupTrees(): Promise<ExternalUserGroupTreeNode[]> {
    await this.auth();

    // Type is 'GroupRepresentation', but 'find' does not return 'attributes' field. Hence, attribute for description is not present.
    const rootGroups = await this.kcAdminClient.groups.find({ realm: this.realm });

    return (await batchProcessPromiseAll(rootGroups, TREES_BATCH_SIZE, group => this.groupRepresentationToTreeNode(group)))
      .filter((node): node is NonNullable<ExternalUserGroupTreeNode> => node != null);
  }

  /**
   * Authenticate to group sync client using client credentials grant type
   */
  private async auth(): Promise<void> {
    const kcGroupSyncClientID: string = configManager.getConfig('crowi', 'external-user-group:keycloak:groupSyncClientID');
    const kcGroupSyncClientSecret: string = configManager.getConfig('crowi', 'external-user-group:keycloak:groupSyncClientSecret');

    await this.kcAdminClient.auth({
      grantType: 'client_credentials',
      clientId: kcGroupSyncClientID,
      clientSecret: kcGroupSyncClientSecret,
    });
  }

  /**
   * Convert GroupRepresentation response returned from Keycloak to ExternalUserGroupTreeNode
   */
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

  /**
   * Fetch group detail from Keycloak and return group description
   */
  private async getGroupDescription(groupId: string): Promise<string | null> {
    if (this.groupDescriptionAttribute == null) return null;

    const groupDetail = await this.kcAdminClient.groups.findOne({ id: groupId, realm: this.realm });

    const description = groupDetail?.attributes?.[this.groupDescriptionAttribute]?.[0];
    return typeof description === 'string' ? description : null;
  }

  /**
   * Convert UserRepresentation array response returned from Keycloak to ExternalUserInfo
   */
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

// eslint-disable-next-line import/no-mutable-exports
export let keycloakUserGroupSyncService: KeycloakUserGroupSyncService | undefined; // singleton instance
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function instanciate(socketIoService): void {
  keycloakUserGroupSyncService = new KeycloakUserGroupSyncService(socketIoService);
}
