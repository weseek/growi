import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
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

  const componentTitle = t('slack_integration.slack_integration');
  const pageTitle = generateCustomTitle(props, componentTitle);

  return (
    <AdminLayout componentTitle={componentTitle}>
      <Head>
        <title>{pageTitle}</title>
      </Head>
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
