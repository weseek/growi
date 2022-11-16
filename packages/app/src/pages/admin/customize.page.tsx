import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Container, Provider } from 'unstated';

import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';
import { useCustomizeTitle, useCurrentUser } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const CustomizeSettingContents = dynamic(() => import('~/components/Admin//Customize/Customize'), { ssr: false });


type Props = CommonProps & {
  customizeTitle: string,
};


const AdminCustomizeSettingsPage: NextPage<Props> = (props) => {
  const { t } = useTranslation('admin');
  useCustomizeTitle(props.customizeTitle);
  useCurrentUser(props.currentUser ?? null);

  const title = t('customize_settings.customize_settings');
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminCustomizeContainer = new AdminCustomizeContainer();

    injectableContainers.push(adminCustomizeContainer);
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
        <CustomizeSettingContents />
      </AdminLayout>
    </Provider>
  );
};


const injectServerConfigurations = async(context: GetServerSidePropsContext, props: Props): Promise<void> => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;

  props.customizeTitle = crowi.configManager.getConfig('crowi', 'customize:title');
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context, injectServerConfigurations);
  return props;
};


export default AdminCustomizeSettingsPage;
