import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Container, Provider } from 'unstated';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const AppSettingsPageContents = dynamic(() => import('~/components/Admin/App/AppSettingsPageContents'), { ssr: false });


const AdminAppPage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation();

  const title = t('commons:headers.app_settings');
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminAppContainer = new AdminAppContainer();
    injectableContainers.push(adminAppContainer);
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
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
