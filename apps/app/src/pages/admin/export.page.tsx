import { isClient } from '@growi/core/dist/utils';
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

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const ExportArchiveDataPage = dynamic(() => import('~/components/Admin/ExportArchiveDataPage'), { ssr: false });


const AdminExportDataArchivePage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);

  const componentTitle = t('export_management.export_archive_data');
  const pageTitle = generateCustomTitle(props, componentTitle);
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminAppContainer = new AdminAppContainer();
    injectableContainers.push(adminAppContainer);
  }

  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout componentTitle={componentTitle}>
        <Head>
          <title>{pageTitle}</title>
        </Head>
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
