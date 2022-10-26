import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

import { useSiteUrl } from '~/stores/context';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const SlackIntegration = dynamic(() => import('~/components/Admin/SlackIntegration/SlackIntegration'), { ssr: false });


type Props = CommonProps & {
  siteUrl: string
};


const AdminSlackIntegrationPage: NextPage<Props> = (props) => {
  const { t } = useTranslation();
  useSiteUrl(props.siteUrl);

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


export default AdminSlackIntegrationPage;
