import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Container, Provider } from 'unstated';

import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, generateCustomTitle } from '~/pages/utils/commons';
import { useCustomizeTitle, useCurrentUser, useIsCustomizedLogoUploaded } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const CustomizeSettingContents = dynamic(() => import('~/components/Admin/Customize/Customize'), { ssr: false });
const Page403 = dynamic(() => import('~/components/Admin/page403'), { ssr: false });


type Props = CommonProps & {
  customizeTitle: string,
  isCustomizedLogoUploaded: boolean,
};


const AdminCustomizeSettingsPage: NextPage<Props> = (props) => {
  const { t } = useTranslation('admin');
  useCustomizeTitle(props.customizeTitle);
  useCurrentUser(props.currentUser ?? null);
  useIsCustomizedLogoUploaded(props.isCustomizedLogoUploaded);

  const componentTitle = t('customize_settings.customize_settings');
  const pageTitle = generateCustomTitle(props, componentTitle);
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminCustomizeContainer = new AdminCustomizeContainer();

    injectableContainers.push(adminCustomizeContainer);
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
        <CustomizeSettingContents />
      </AdminLayout>
    </Provider>
  );
};


const injectServerConfigurations = async(context: GetServerSidePropsContext, props: Props): Promise<void> => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;

  props.customizeTitle = crowi.configManager.getConfig('crowi', 'customize:title');
  props.isCustomizedLogoUploaded = await crowi.attachmentService.isBrandLogoExist();
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context, injectServerConfigurations);
  return props;
};


export default AdminCustomizeSettingsPage;
