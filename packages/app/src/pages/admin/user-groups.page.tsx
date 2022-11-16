import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';
import {
  useIsAclEnabled, useCurrentUser, useIsSearchPage, useIsSearchServiceConfigured,
  useIsSearchScopeChildrenAsDefault,
} from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const UserGroupPage = dynamic(() => import('~/components/Admin/UserGroup/UserGroupPage').then(mod => mod.UserGroupPage), { ssr: false });


type Props = CommonProps & {
  isAclEnabled: boolean
};


const AdminUserGroupPage: NextPage<Props> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);
  useIsAclEnabled(props.isAclEnabled);
  useIsSearchPage(false);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  const title = t('user_group_management.user_group_management');

  return (
    <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
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
