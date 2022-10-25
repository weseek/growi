import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Container, Provider } from 'unstated';

import AdminMarkDownContainer from '~/client/services/AdminMarkDownContainer';
import { SupportedActionType } from '~/interfaces/activity';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });

// const AppSettingsPageContents = dynamic(() => import('~/components/Admin/App/AppSettingsPageContents'), { ssr: false });
const MarkDownSettingContents = dynamic(() => import('~/components/Admin/MarkdownSetting/MarkDownSettingContents'), { ssr: false });


type Props = CommonProps & {
  currentUser: any,

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


const AdminMarkdownPage: NextPage<Props> = (props) => {
  const { t } = useTranslation();

  const title = t('markdown_settings.markdown_settings');
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminMarkDownContainer = new AdminMarkDownContainer();

    injectableContainers.push(adminMarkDownContainer);
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
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
