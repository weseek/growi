import { isClient } from '@growi/core/dist/utils';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Container, Provider } from 'unstated';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser, useIsMailerSetup } from '~/stores/context';

import { retrieveServerSideProps } from '../../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });

const UserManagement = dynamic(() => import('~/components/Admin/UserManagement'), { ssr: false });


type Props = CommonProps & {
  isMailerSetup: boolean,
};


const AdminUserManagementPage: NextPage<Props> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);
  useIsMailerSetup(props.isMailerSetup);

  const title = t('user_management.user_management');
  const headTitle = generateCustomTitle(props, title);
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminUsersContainer = new AdminUsersContainer();

    injectableContainers.push(adminUsersContainer);
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout componentTitle={title}>
        <Head>
          <title>{headTitle}</title>
        </Head>
        <UserManagement />
      </AdminLayout>
    </Provider>
  );

};

const injectServerConfigurations = async(context: GetServerSidePropsContext, props: Props): Promise<void> => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { mailService } = crowi;

  props.isMailerSetup = mailService.isMailerSetup;
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context, injectServerConfigurations);
  return props;
};


export default AdminUserManagementPage;
