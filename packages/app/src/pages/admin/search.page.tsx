import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';
import { useIsSearchServiceReachable } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const FullTextSearchManagement = dynamic(
  () => import('~/components/Admin//FullTextSearchManagement').then(mod => mod.FullTextSearchManagement), { ssr: false },
);


type Props = CommonProps & {
  isSearchServiceReachable: boolean,
};


const AdminFullTextSearchManagementPage: NextPage<Props> = (props) => {
  const { t } = useTranslation('admin');
  useIsSearchServiceReachable(props.isSearchServiceReachable);

  const title = t('full_text_search_management.full_text_search_management');

  return (
    <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
      <FullTextSearchManagement />
    </AdminLayout>
  );
};

const injectServerConfigurations = async(context: GetServerSidePropsContext, props: Props): Promise<void> => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { searchService } = crowi;

  props.isSearchServiceReachable = searchService.isReachable;
};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context, injectServerConfigurations);
  return props;
};


export default AdminFullTextSearchManagementPage;
