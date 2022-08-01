import AdminAppContainer from '~/client/services/AdminAppContainer';
import AdminBasicSecurityContainer from '~/client/services/AdminBasicSecurityContainer';
import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import AdminExternalAccountsContainer from '~/client/services/AdminExternalAccountsContainer';
import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';
import AdminGitHubSecurityContainer from '~/client/services/AdminGitHubSecurityContainer';
import AdminGoogleSecurityContainer from '~/client/services/AdminGoogleSecurityContainer';
import AdminHomeContainer from '~/client/services/AdminHomeContainer';
import AdminImportContainer from '~/client/services/AdminImportContainer';
import AdminLdapSecurityContainer from '~/client/services/AdminLdapSecurityContainer';
import AdminLocalSecurityContainer from '~/client/services/AdminLocalSecurityContainer';
import AdminMarkDownContainer from '~/client/services/AdminMarkDownContainer';
import AdminNotificationContainer from '~/client/services/AdminNotificationContainer';
import AdminOidcSecurityContainer from '~/client/services/AdminOidcSecurityContainer';
import AdminSamlSecurityContainer from '~/client/services/AdminSamlSecurityContainer';
import AdminSlackIntegrationLegacyContainer from '~/client/services/AdminSlackIntegrationLegacyContainer';
import AdminTwitterSecurityContainer from '~/client/services/AdminTwitterSecurityContainer';
import AdminUserGroupDetailContainer from '~/client/services/AdminUserGroupDetailContainer';
import AdminUsersContainer from '~/client/services/AdminUsersContainer';

type AdminUnstatedContainers =
  AdminAppContainer | AdminBasicSecurityContainer | AdminCustomizeContainer | AdminExternalAccountsContainer |
  AdminGeneralSecurityContainer | AdminGitHubSecurityContainer | AdminGoogleSecurityContainer | AdminHomeContainer |
  AdminImportContainer | AdminLdapSecurityContainer | AdminLocalSecurityContainer | AdminMarkDownContainer |
  AdminNotificationContainer | AdminOidcSecurityContainer | AdminSamlSecurityContainer | AdminSlackIntegrationLegacyContainer |
  AdminTwitterSecurityContainer | AdminUserGroupDetailContainer | AdminUsersContainer;

export type AdminInjectableContainers = AdminUnstatedContainers[];
