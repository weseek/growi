import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Container, Provider } from 'unstated';

import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { useCustomizeTitle } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });

const AppSettingsPageContents = dynamic(() => import('~/components/Admin/App/AppSettingsPageContents'), { ssr: false });


type Props = CommonProps & {
  customizeTitle: string,
};


const AdminCustomizeSettingsPage: NextPage<Props> = (props) => {
  const { t } = useTranslation();
  useCustomizeTitle(props.customizeTitle);

  const title = t('customize_settings.customize_settings');
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminCustomizeContainer = new AdminCustomizeContainer();

    injectableContainers.push(adminCustomizeContainer);
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


export default AdminCustomizeSettingsPage;
