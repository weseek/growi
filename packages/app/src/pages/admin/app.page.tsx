import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';

import AdminPage from '~/components/Admin/AdminPage';
import { SupportedActionType } from '~/interfaces/activity';
import { CommonProps } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';


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
  return <AdminPage {...props}/>;

};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminAppPage;
