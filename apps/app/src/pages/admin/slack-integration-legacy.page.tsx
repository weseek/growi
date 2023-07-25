import { isClient } from '@growi/core/dist/utils';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Container, Provider } from 'unstated';

import AdminSlackIntegrationLegacyContainer from '~/client/services/AdminSlackIntegrationLegacyContainer';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const LegacySlackIntegration = dynamic(() => import('~/components/Admin/LegacySlackIntegration/LegacySlackIntegration'), { ssr: false });


const AdminLegacySlackIntegrationPage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);

  const title = t('slack_integration_legacy.slack_integration_legacy');
  const headTitle = generateCustomTitle(props, title);
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminSlackIntegrationLegacyContainer = new AdminSlackIntegrationLegacyContainer();
    injectableContainers.push(adminSlackIntegrationLegacyContainer);
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout componentTitle={title}>
        <Head>
          <title>{headTitle}</title>
        </Head>
        <LegacySlackIntegration />
      </AdminLayout>
    </Provider>
  );

};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminLegacySlackIntegrationPage;
