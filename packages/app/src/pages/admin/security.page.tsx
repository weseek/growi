import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Container, Provider } from 'unstated';

import AdminBasicSecurityContainer from '~/client/services/AdminBasicSecurityContainer';
import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';
import AdminGitHubSecurityContainer from '~/client/services/AdminGitHubSecurityContainer';
import AdminGoogleSecurityContainer from '~/client/services/AdminGoogleSecurityContainer';
import AdminLdapSecurityContainer from '~/client/services/AdminLdapSecurityContainer';
import AdminLocalSecurityContainer from '~/client/services/AdminLocalSecurityContainer';
import AdminOidcSecurityContainer from '~/client/services/AdminOidcSecurityContainer';
import AdminSamlSecurityContainer from '~/client/services/AdminSamlSecurityContainer';
import AdminTwitterSecurityContainer from '~/client/services/AdminTwitterSecurityContainer';
import { SupportedActionType } from '~/interfaces/activity';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });

// const SecurityManagement = dynamic(() => import('./Security/SecurityManagement'), { ssr: false });
const SecurityManagement = dynamic(() => import('~/components/Admin/Security/SecurityManagement'), { ssr: false });


type Props = CommonProps & {
  currentUser: any,

  nodeVersion: string,
  npmVersion: string,
  yarnVersion: string,
  installedPlugins: any,
  envVars: any,
  isAclEnabled: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isMailerSetup: boolean,
  auditLogEnabled: boolean,
  auditLogAvailableActions: SupportedActionType[],

  customizeTitle: string,
  siteUrl: string,
};


const AdminAppPage: NextPage<Props> = (props) => {
  const { t } = useTranslation();

  const title = t('commons:headers.app_settings');
  const adminSecurityContainers: Container<any>[] = [];

  if (isClient()) {
    const adminSecuritySettingElem = document.getElementById('admin-security-setting');

    if (adminSecuritySettingElem != null) {
      // Create unstated container instances (Security)
      const adminGeneralSecurityContainer = new AdminGeneralSecurityContainer();
      const adminLocalSecurityContainer = new AdminLocalSecurityContainer();
      const adminLdapSecurityContainer = new AdminLdapSecurityContainer();
      const adminSamlSecurityContainer = new AdminSamlSecurityContainer();
      const adminOidcSecurityContainer = new AdminOidcSecurityContainer();
      const adminBasicSecurityContainer = new AdminBasicSecurityContainer();
      const adminGoogleSecurityContainer = new AdminGoogleSecurityContainer();
      const adminGitHubSecurityContainer = new AdminGitHubSecurityContainer();
      const adminTwitterSecurityContainer = new AdminTwitterSecurityContainer();

      adminSecurityContainers.push(
        adminGeneralSecurityContainer,
        adminLocalSecurityContainer,
        adminLdapSecurityContainer,
        adminSamlSecurityContainer,
        adminOidcSecurityContainer,
        adminBasicSecurityContainer,
        adminGoogleSecurityContainer,
        adminGitHubSecurityContainer,
        adminTwitterSecurityContainer,
      );
    }
  }


  return (
    <Provider inject={[...adminSecurityContainers]}>
      <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
        <SecurityManagement />
      </AdminLayout>
    </Provider>
  );

};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminAppPage;
