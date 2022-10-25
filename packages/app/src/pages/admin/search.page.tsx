import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Container, Provider } from 'unstated';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import { SupportedActionType } from '~/interfaces/activity';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });

const ElasticsearchManagement = dynamic(() => import('~/components/Admin/ElasticsearchManagement/ElasticsearchManagement'), { ssr: false });


type Props = CommonProps & {
  currentUser: any,

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


const AdminFullTextSearchManagementPage: NextPage<Props> = (props) => {
  const { t } = useTranslation();
  const title = t('full_text_search_management.full_text_search_management');

  return (
    <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
      <ElasticsearchManagement />
    </AdminLayout>
  );
};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminFullTextSearchManagementPage;
