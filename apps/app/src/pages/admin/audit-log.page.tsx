import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { SupportedActionType } from '~/interfaces/activity';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser, useAuditLogEnabled, useAuditLogAvailableActions } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const AuditLogManagement = dynamic(() => import('~/components/Admin/AuditLogManagement').then(mod => mod.AuditLogManagement), { ssr: false });
const Page403 = dynamic(() => import('~/components/Admin/page403'), { ssr: false });


type Props = CommonProps & {
  auditLogEnabled: boolean,
  auditLogAvailableActions: SupportedActionType[],
};


const AdminAuditLogPage: NextPage<Props> = (props) => {
  const { t } = useTranslation('admin');
  useAuditLogEnabled(props.auditLogEnabled);
  useAuditLogAvailableActions(props.auditLogAvailableActions);
  useCurrentUser(props.currentUser ?? null);

  const title = t('audit_log_management.audit_log');
  const headTitle = generateCustomTitle(props, title);

  if (props.isAccessDeniedForNonAdminUser) {
    return <Page403 />;
  }

  return (
    <AdminLayout componentTitle={title}>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <AuditLogManagement />
    </AdminLayout>
  );

};

const injectServerConfigurations = async(context: GetServerSidePropsContext, props: Props): Promise<void> => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { activityService } = crowi;

  props.auditLogEnabled = crowi.configManager.getConfig('crowi', 'app:auditLogEnabled');
  props.auditLogAvailableActions = activityService.getAvailableActions(false);
};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context, injectServerConfigurations);
  return props;
};


export default AdminAuditLogPage;
