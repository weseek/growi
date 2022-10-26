import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Container, Provider } from 'unstated';

import AdminImportContainer from '~/client/services/AdminImportContainer';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const DataImportPageContents = dynamic(() => import('~/components/Admin/ImportData/ImportDataPageContents'), { ssr: false });


const AdminDataImportPage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation();

  const title = t('importer_management.import_data');
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminImportContainer = new AdminImportContainer();
    injectableContainers.push(adminImportContainer);
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
        <DataImportPageContents />
      </AdminLayout>
    </Provider>
  );

};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminDataImportPage;
