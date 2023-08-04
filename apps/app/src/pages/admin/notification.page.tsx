import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Container, Provider } from 'unstated';

import AdminNotificationContainer from '~/client/services/AdminNotificationContainer';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const NotificationSetting = dynamic(() => import('~/components/Admin/Notification/NotificationSetting'), { ssr: false });
const Page403 = dynamic(() => import('~/components/Admin/page403'), { ssr: false });


const AdminExternalNotificationPage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);

  const componentTitle = t('external_notification.external_notification');
  const pageTitle = generateCustomTitle(props, componentTitle);
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminNotificationContainer = new AdminNotificationContainer();

    injectableContainers.push(adminNotificationContainer);
  }

  if (props.isAccessDeniedForNonAdminUser) {
    return <Page403 />;
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout componentTitle={componentTitle}>
        <Head>
          <title>{pageTitle}</title>
        </Head>
        <NotificationSetting />
      </AdminLayout>
    </Provider>
  );

};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminExternalNotificationPage;
