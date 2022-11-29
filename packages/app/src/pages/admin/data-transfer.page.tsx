import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { CommonProps, useCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const G2GDataTransferPage = dynamic(() => import('~/components/Admin/G2GDataTransfer'), { ssr: false });


type Props = CommonProps;


const DataTransferPage: NextPage<Props> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);

  const title = t('g2g_data_transfer.data_transfer');

  return (
    <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
      <G2GDataTransferPage />
    </AdminLayout>
  );
};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default DataTransferPage;
