import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';


import { SupportedActionType } from '~/interfaces/activity';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });

const AuditLogManagement = dynamic(() => import('~/components/Admin/AuditLogManagement').then(mod => mod.AuditLogManagement), { ssr: false });


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


const AdminAuditLogPage: NextPage<Props> = (props) => {
  const { t } = useTranslation();
  const title = t('audit_log_management.audit_log');

  return (
    <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
      <AuditLogManagement />
    </AdminLayout>
  );

};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminAuditLogPage;
