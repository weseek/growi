import { isClient } from '@growi/core/dist/utils';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Container, Provider } from 'unstated';

import AdminExternalAccountsContainer from '~/client/services/AdminExternalAccountsContainer';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser } from '~/stores/context';

import { retrieveServerSideProps } from '../../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const ManageExternalAccount = dynamic(() => import('~/components/Admin/ManageExternalAccount'), { ssr: false });


const AdminUserManagementPage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);

  const title = t('user_management.external_account');
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminExternalAccountsContainer = new AdminExternalAccountsContainer();

    injectableContainers.push(
      adminExternalAccountsContainer,
    );
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout componentTitle={title}>
        <Head>
          <title>{title}</title>
        </Head>
        <ManageExternalAccount />
      </AdminLayout>
    </Provider>
  );

};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminUserManagementPage;
