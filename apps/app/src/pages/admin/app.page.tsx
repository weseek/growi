import type { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';

import type { NextPageWithLayout } from '../_app.page';

import type { AdminCommonProps } from './_shared';
import { createAdminPageLayout, getServerSideAdminCommonProps } from './_shared';

const AppSettingsPageContents = dynamic(() => import('~/client/components/Admin/App/AppSettingsPageContents'), { ssr: false });

type Props = AdminCommonProps;

const AdminAppPage: NextPageWithLayout<Props> = () => <AppSettingsPageContents />;

AdminAppPage.getLayout = createAdminPageLayout<Props>({
  title: (_p, t) => t('headers.app_settings'),
  containerFactories: [
    async() => {
      const AdminAppContainer = (await import('~/client/services/AdminAppContainer')).default;
      return new AdminAppContainer();
    },
  ],
});

export const getServerSideProps: GetServerSideProps = async(context) => {
  // Just delegate to common admin props (no extra server props for this page now)
  return getServerSideAdminCommonProps(context);
};

export default AdminAppPage;
