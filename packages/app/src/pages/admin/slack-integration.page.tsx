import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { SupportedActionType } from '~/interfaces/activity';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });

const SlackIntegration = dynamic(() => import('~/components/Admin/SlackIntegration/SlackIntegration'), { ssr: false });


type Props = CommonProps & {
  currentUser: any,

  nodeVersion: string,
  npmVersion: string,
  yarnVersion: string,
  installedPlugins: any,
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


const AdminAppPage: NextPage<Props> = (props) => {
  const { t } = useTranslation();
  const title = t('slack_integration.slack_integration');

  return (
    <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
      <SlackIntegration />
    </AdminLayout>
  );
};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminAppPage;
