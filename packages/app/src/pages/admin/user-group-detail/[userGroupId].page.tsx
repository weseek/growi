import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { CommonProps, useCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser } from '~/stores/context';
import { useIsMaintenanceMode } from '~/stores/maintenanceMode';

import { retrieveServerSideProps } from '../../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const UserGroupDetailPage = dynamic(() => import('~/components/Admin/UserGroupDetail/UserGroupDetailPage'), { ssr: false });


const AdminUserGroupDetailPage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation('admin');
  useIsMaintenanceMode(props.isMaintenanceMode);
  useCurrentUser(props.currentUser ?? null);
  const router = useRouter();
  const { userGroupId } = router.query;

  const title = t('user_group_management.user_group_management');
  const customTitle = useCustomTitle(props, title);


  const currentUserGroupId = Array.isArray(userGroupId) ? userGroupId[0] : userGroupId;

  return (
    <AdminLayout title={customTitle} componentTitle={title} >
      {
        currentUserGroupId != null && router.isReady
      && <UserGroupDetailPage userGroupId={currentUserGroupId} />
      }
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminUserGroupDetailPage;
