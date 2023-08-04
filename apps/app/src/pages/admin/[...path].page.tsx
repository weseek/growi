import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import dynamic from 'next/dynamic';

import { CommonProps } from '~/pages/utils/commons';
import { useCurrentUser } from '~/stores/context';
import { useIsMaintenanceMode } from '~/stores/maintenanceMode';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const AdminNotFoundPage = dynamic(() => import('~/components/Admin/NotFoundPage').then(mod => mod.AdminNotFoundPage), { ssr: false });
const Page403 = dynamic(() => import('~/components/Admin/page403').then(mod => mod.Page403), { ssr: false });


const AdminAppPage: NextPage<CommonProps> = (props) => {
  useIsMaintenanceMode(props.isMaintenanceMode);
  useCurrentUser(props.currentUser ?? null);

  if (props.isAccessDeniedForNonAdminUser) {
    return <Page403 />;
  }

  return (
    <AdminLayout>
      <AdminNotFoundPage />
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminAppPage;
