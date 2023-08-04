import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Container, Provider } from 'unstated';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser } from '~/stores/context';
import { useIsMaintenanceMode } from '~/stores/maintenanceMode';

import { retrieveServerSideProps } from '../../utils/admin-page-util';


const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const AppSettingsPageContents = dynamic(() => import('~/components/Admin/App/AppSettingsPageContents'), { ssr: false });
const Page403 = dynamic(() => import('~/components/Admin/page403'), { ssr: false });


const AdminAppPage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation('commons');
  useIsMaintenanceMode(props.isMaintenanceMode);
  useCurrentUser(props.currentUser ?? null);

  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminAppContainer = new AdminAppContainer();
    injectableContainers.push(adminAppContainer);
  }

  const title = generateCustomTitle(props, t('headers.app_settings'));

  if (props.isAccessDeniedForNonAdminUser) {
    return <Page403 />;
  }

  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout componentTitle={title}>
        <Head>
          <title>{title}</title>
        </Head>
        <AppSettingsPageContents />
      </AdminLayout>
    </Provider>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminAppPage;
