import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Container, Provider } from 'unstated';


import AdminMarkDownContainer from '~/client/services/AdminMarkDownContainer';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
import { useCurrentUser } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const MarkDownSettingContents = dynamic(() => import('~/components/Admin/MarkdownSetting/MarkDownSettingContents'), { ssr: false });
const Page403 = dynamic(() => import('~/components/Admin/page403'), { ssr: false });


const AdminMarkdownPage: NextPage<CommonProps> = (props) => {
  const { t } = useTranslation('admin');
  useCurrentUser(props.currentUser ?? null);

  const componentTitle = t('markdown_settings.markdown_settings');
  const pageTitle = generateCustomTitle(props, componentTitle);

  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminMarkDownContainer = new AdminMarkDownContainer();
    injectableContainers.push(adminMarkDownContainer);
  }

  if (props.isAccessDeniedForNonAdminUser) {
    return <Page403 />;
  }

  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout componentTitle={componentTitle}>
        <Head>
          <title>{pageTitle}</title>
        </Head>
        <MarkDownSettingContents />
      </AdminLayout>
    </Provider>
  );

};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminMarkdownPage;
