import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Container, Provider } from 'unstated';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser, useIsSearchPage, useIsSearchServiceConfigured } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const ExportArchiveDataPage = dynamic(() => import('~/components/Admin/ExportArchiveDataPage'), { ssr: false });


const AdminExportDataArchivePage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);
  useIsSearchPage(false);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);

  const title = t('export_management.export_archive_data');
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminAppContainer = new AdminAppContainer();
    injectableContainers.push(adminAppContainer);
  }

  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
        <ExportArchiveDataPage />
      </AdminLayout>
    </Provider>
  );
};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminExportDataArchivePage;
