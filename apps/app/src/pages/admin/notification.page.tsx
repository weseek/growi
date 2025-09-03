/* eslint-disable react/prop-types */
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { useCustomTitle } from '~/pages/utils/page-title-customization';

import type { NextPageWithLayout } from '../_app.page';
import type { CommonInitialProps, CommonEachProps } from '../common-props';
import { getServerSideCommonInitialProps, getServerSideCommonEachProps, getServerSideI18nProps } from '../common-props';
import { mergeGetServerSidePropsResults } from '../utils/server-side-props';

import { AdminPageFrame } from './_shared/AdminPageFrame';
import { useAdminContainers } from './_shared/useAdminContainers';

const NotificationSetting = dynamic(() => import('~/client/components/Admin/Notification/NotificationSetting'), { ssr: false });

type Props = CommonInitialProps & CommonEachProps & {
  isAccessDeniedForNonAdminUser: boolean;
};

const AdminExternalNotificationPage: NextPageWithLayout<Props> = () => <NotificationSetting />;

// A wrapping component to legally use hooks while following getLayout pattern
interface NotificationPageLayoutProps { page: JSX.Element & { props: Props } }
const NotificationPageLayout: React.FC<NotificationPageLayoutProps> = (propsWrapper) => {
  const page = propsWrapper.page;
  const props = page.props;
  const { t } = useTranslation('admin');
  const componentTitle = t('external_notification.external_notification');
  const title = useCustomTitle(componentTitle);
  const containers = useAdminContainers([
    async() => {
      const AdminNotificationContainer = (await import('~/client/services/AdminNotificationContainer')).default;
      return new AdminNotificationContainer();
    },
  ]);

  return (
    <AdminPageFrame
      title={title}
      componentTitle={componentTitle}
      isAccessDeniedForNonAdminUser={props.isAccessDeniedForNonAdminUser}
      containers={containers}
    >
      {page}
    </AdminPageFrame>
  );
};

AdminExternalNotificationPage.getLayout = page => <NotificationPageLayout page={page} />;

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const [commonInitialResult, commonEachResult, i18nResult] = await Promise.all([
    getServerSideCommonInitialProps(context),
    getServerSideCommonEachProps(context),
    getServerSideI18nProps(context, ['admin']),
  ]);

  const merged = mergeGetServerSidePropsResults(commonInitialResult,
    mergeGetServerSidePropsResults(commonEachResult, i18nResult));

  if ('props' in merged) {
    const mergedProps = merged.props as CommonInitialProps & CommonEachProps & { isAccessDeniedForNonAdminUser?: boolean, currentUser?: { admin?: boolean } };
    const currentUser = mergedProps.currentUser;
    mergedProps.isAccessDeniedForNonAdminUser = currentUser == null ? true : !currentUser.admin;
  }

  return merged;
};

export default AdminExternalNotificationPage;
