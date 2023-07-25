import { isClient } from '@growi/core/dist/utils';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Container, Provider } from 'unstated';

import AdminImportContainer from '~/client/services/AdminImportContainer';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const DataImportPageContents = dynamic(() => import('~/components/Admin/ImportData/ImportDataPageContents'), { ssr: false });


const AdminDataImportPage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);

  const componentTitle = t('importer_management.import_data');
  const pageTitle = generateCustomTitle(props, componentTitle);
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminImportContainer = new AdminImportContainer();
    injectableContainers.push(adminImportContainer);
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout componentTitle={componentTitle}>
        <Head>
          <title>{pageTitle}</title>
        </Head>
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
