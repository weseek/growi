import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { CommonProps, useCustomTitle } from '~/pages/utils/commons';
import { useIsSearchServiceReachable } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });

const ElasticsearchManagement = dynamic(() => import('~/components/Admin/ElasticsearchManagement/ElasticsearchManagement'), { ssr: false });


type Props = CommonProps & {
  isSearchServiceReachable: boolean,
};


const AdminFullTextSearchManagementPage: NextPage<Props> = (props) => {
  const { t } = useTranslation();
  useIsSearchServiceReachable(props.isSearchServiceReachable);

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
