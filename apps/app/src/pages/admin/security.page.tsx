import { isClient } from '@growi/core/dist/utils';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Container, Provider } from 'unstated';

import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';
import AdminGitHubSecurityContainer from '~/client/services/AdminGitHubSecurityContainer';
import AdminGoogleSecurityContainer from '~/client/services/AdminGoogleSecurityContainer';
import AdminLdapSecurityContainer from '~/client/services/AdminLdapSecurityContainer';
import AdminLocalSecurityContainer from '~/client/services/AdminLocalSecurityContainer';
import AdminOidcSecurityContainer from '~/client/services/AdminOidcSecurityContainer';
import AdminSamlSecurityContainer from '~/client/services/AdminSamlSecurityContainer';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser, useIsMailerSetup, useSiteUrl } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const SecurityManagement = dynamic(() => import('~/components/Admin/Security/SecurityManagement'), { ssr: false });
const ForbiddenPage = dynamic(() => import('~/components/Admin/ForbiddenPage').then(mod => mod.ForbiddenPage), { ssr: false });


type Props = CommonProps & {
  isMailerSetup: boolean,
  siteUrl: string,
};


const AdminSecuritySettingsPage: NextPage<Props> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);
  useSiteUrl(props.siteUrl);
  useIsMailerSetup(props.isMailerSetup);

  const componentTitle = t('security_settings.security_settings');
  const pageTitle = generateCustomTitle(props, componentTitle);
  const adminSecurityContainers: Container<any>[] = [];

  if (isClient()) {
    const adminSecuritySettingElem = document.getElementById('admin-security-setting');

    if (adminSecuritySettingElem != null) {
      const adminGeneralSecurityContainer = new AdminGeneralSecurityContainer();
      const adminLocalSecurityContainer = new AdminLocalSecurityContainer();
      const adminLdapSecurityContainer = new AdminLdapSecurityContainer();
      const adminSamlSecurityContainer = new AdminSamlSecurityContainer();
      const adminOidcSecurityContainer = new AdminOidcSecurityContainer();
      const adminGoogleSecurityContainer = new AdminGoogleSecurityContainer();
      const adminGitHubSecurityContainer = new AdminGitHubSecurityContainer();

      adminSecurityContainers.push(
        adminGeneralSecurityContainer,
        adminLocalSecurityContainer,
        adminLdapSecurityContainer,
        adminSamlSecurityContainer,
        adminOidcSecurityContainer,
        adminGoogleSecurityContainer,
        adminGitHubSecurityContainer,
      );
    }
  }

  if (props.isAccessDeniedForNonAdminUser) {
    return <ForbiddenPage />;
  }

  return (
    <Provider inject={[...adminSecurityContainers]}>
      <AdminLayout componentTitle={componentTitle}>
        <Head>
          <title>{pageTitle}</title>
        </Head>
        <SecurityManagement />
      </AdminLayout>
    </Provider>
  );
};

const injectServerConfigurations = async(context: GetServerSidePropsContext, props: Props): Promise<void> => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { appService, mailService } = crowi;

  props.siteUrl = appService.getSiteUrl();
  props.isMailerSetup = mailService.isMailerSetup;
};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context, injectServerConfigurations);
  return props;
};


export default AdminSecuritySettingsPage;
