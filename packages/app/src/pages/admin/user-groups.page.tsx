import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { CommonProps, useCustomTitle } from '~/pages/utils/commons';
import { retrieveServerSideProps } from '../../utils/admin-page-util';
import { useIsAclEnabled } from '~/stores/context';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const UserGroupPage = dynamic(() => import('~/components/Admin/UserGroup/UserGroupPage').then(mod => mod.UserGroupPage), { ssr: false });


type Props = CommonProps & {
  isAclEnabled: boolean
};


const AdminUserGroupPage: NextPage<Props> = (props) => {
  const { t } = useTranslation();
  useIsAclEnabled(props.isAclEnabled);

  const title = t('user_group_management.user_group_management');

  return (
    <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
      <UserGroupPage />
    </AdminLayout>
  );
};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminUserGroupPage;
