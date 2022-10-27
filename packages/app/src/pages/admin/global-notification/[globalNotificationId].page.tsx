import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Container, Provider } from 'unstated';

import AdminNotificationContainer from '~/client/services/AdminNotificationContainer';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const ManageGlobalNotification = dynamic(() => import('~/components/Admin/Notification/ManageGlobalNotification'), { ssr: false });


const AdminGlobalNotificationNewPage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const { globalNotificationId } = router.query;

  const title = t('external_notification.external_notification');
  const customTitle = useCustomTitle(props, title);

  const currentGlobalNotificationId = Array.isArray(globalNotificationId) ? globalNotificationId[0] : globalNotificationId;

  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminNotificationContainer = new AdminNotificationContainer();
    injectableContainers.push(adminNotificationContainer);
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout title={customTitle} componentTitle={title} >
        {
          currentGlobalNotificationId != null && router.isReady
      && <ManageGlobalNotification globalNotificationId={currentGlobalNotificationId} />
        }
      </AdminLayout>
    </Provider>
  );

};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminGlobalNotificationNewPage;
