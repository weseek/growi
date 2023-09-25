import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
import { useIsAclEnabled, useCurrentUser } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const UserGroupPage = dynamic(() => import('~/components/Admin/UserGroup/UserGroupPage').then(mod => mod.UserGroupPage), { ssr: false });
const ForbiddenPage = dynamic(() => import('~/components/Admin/ForbiddenPage').then(mod => mod.ForbiddenPage), { ssr: false });


type Props = CommonProps & {
  isAclEnabled: boolean
};


const AdminUserGroupPage: NextPage<Props> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);
  useIsAclEnabled(props.isAclEnabled);

  const title = t('user_group_management.user_group_management');
  const headTitle = generateCustomTitle(props, title);

  if (props.isAccessDeniedForNonAdminUser) {
    return <ForbiddenPage />;
  }

  return (
    <AdminLayout componentTitle={title}>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <UserGroupPage />
    </AdminLayout>
  );
};


const injectServerConfigurations = async(context: GetServerSidePropsContext, props: Props): Promise<void> => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { aclService } = crowi;

  props.isAclEnabled = aclService.isAclEnabled();
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context, injectServerConfigurations);
  return props;
};


export default AdminUserGroupPage;
