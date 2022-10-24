import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import dynamic from 'next/dynamic';

import AdminPage from '~/components/Admin/AdminPage';
import { SupportedActionType } from '~/interfaces/activity';
import { CommonProps } from '~/pages/utils/commons';

import { executeGetServerSideProps } from '../../utils/admin-page-util';

// const AdminPage = dynamic(() => import('~/components/Admin/AdminPage'), { ssr: false });

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

  console.log({ propsAdminAppPage: props });

  return <AdminPage {...props}/>;
  // return <>hoge</>;

};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await executeGetServerSideProps(context);

  console.log('aaa');

  return props;
};


export default AdminAppPage;
