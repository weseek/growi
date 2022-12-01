import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { CommonProps, useCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser } from '~/stores/context';
import { useIsMaintenanceMode } from '~/stores/maintenanceMode';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const AdminNotFoundPage = dynamic(() => import('~/components/Admin/NotFoundPage').then(mod => mod.AdminNotFoundPage), { ssr: false });


const AdminAppPage: NextPage<CommonProps> = (props) => {
  useIsMaintenanceMode(props.isMaintenanceMode);
  useCurrentUser(props.currentUser ?? null);

  const title = useCustomTitle(props, 'GROWI');

  return (
    <AdminLayout>
      <Head>
        <title>{title}</title>
      </Head>
      <AdminNotFoundPage />
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminAppPage;
