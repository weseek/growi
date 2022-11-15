import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser, useSiteUrl } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';


const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const SlackIntegration = dynamic(() => import('~/components/Admin/SlackIntegration/SlackIntegration'), { ssr: false });


type Props = CommonProps & {
  siteUrl: string
};


const AdminSlackIntegrationPage: NextPage<Props> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);
  useSiteUrl(props.siteUrl);

  const title = t('slack_integration.slack_integration');

  return (
    <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
      <SlackIntegration />
    </AdminLayout>
  );
};


const injectServerConfigurations = async(context: GetServerSidePropsContext, props: Props): Promise<void> => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { appService } = crowi;

  props.siteUrl = appService.getSiteUrl();
};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context, injectServerConfigurations);
  return props;
};


export default AdminSlackIntegrationPage;
