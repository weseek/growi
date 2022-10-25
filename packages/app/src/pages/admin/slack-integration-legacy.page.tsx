import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Container, Provider } from 'unstated';

import AdminSlackIntegrationLegacyContainer from '~/client/services/AdminSlackIntegrationLegacyContainer';
import { SupportedActionType } from '~/interfaces/activity';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });

const LegacySlackIntegration = dynamic(() => import('~/components/Admin/LegacySlackIntegration/LegacySlackIntegration'), { ssr: false });


type Props = CommonProps & {
  currentUser: any,

  // nodeVersion: string,
  // npmVersion: string,
  // yarnVersion: string,
  // installedPlugins: any,
  envVars: any,
  isAclEnabled: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isMailerSetup: boolean,
  auditLogEnabled: boolean,
  auditLogAvailableActions: SupportedActionType[],

  customizeTitle: string,
  siteUrl: string,
};


const AdminLegacySlackIntegrationPage: NextPage<Props> = (props) => {
  const { t } = useTranslation();

  const title = t('slack_integration_legacy.slack_integration_legacy');
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminSlackIntegrationLegacyContainer = new AdminSlackIntegrationLegacyContainer();

    injectableContainers.push(adminSlackIntegrationLegacyContainer);
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
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
