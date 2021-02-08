import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useRouter } from 'next/router';

import AdminLayout from '~/components/AdminLayout';

import { useTranslation } from '~/i18n';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, getServerSideCommonProps } from '~/utils/nextjs-page-utils';

import AppSettingsPageContents from '~/components/Admin/App/AppSettingsPageContents';
import CustomizeSettingContents from '~/components/Admin/Customize/CustomizeSettingContents';
import DataImportPageContents from '~/components/Admin/DataImport/DataImportPageContents';
import ExportArchiveDataPage from '~/components/Admin/DataExport/ExportArchiveDataPage';

import {
  useCurrentUser,
  useSearchServiceConfigured, useSearchServiceReachable,
} from '../../stores/context';

type Props = CommonProps & {
  currentUser: any,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
};

const AdminMarkdownSettingsPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const path = router.query.path || 'home';
  const name = Array.isArray(path) ? path[0] : path;

  const adminPagesMap = {
    home: {
      title: t('Wiki Management Home Page'),
      component: <></>,
    },
    app: {
      title: t('App Settings'),
      component: <AppSettingsPageContents />,
    },
    security: {
      title: '',
      component: <></>,
    },
    markdown: {
      title: t('Markdown Settings'),
      component: <></>,
    },
    customize: {
      title: t('Customize Settings'),
      component: <CustomizeSettingContents />,
    },
    importer: {
      title: t('Import Data'),
      component: <DataImportPageContents />,
    },
    export: {
      title: t('Export Archive Data'),
      component: <ExportArchiveDataPage />,
    },
    notification: {
      title: '',
      component: <></>,
    },
    'global-notification': {
      title: '',
      component: <></>,
    },
    users: {
      title: '',
      component: <></>,
    },
    'user-groups': {
      title: '',
      component: <></>,
    },
    search: {
      title: '',
      component: <></>,
    },
  };

  const content = adminPagesMap[name];
  const title = content.title;

  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);

  useSearchServiceConfigured(props.isSearchServiceConfigured);
  useSearchServiceReachable(props.isSearchServiceReachable);

  return (
    <AdminLayout title={title} selectedNavOpt={name}>
      {content.component}
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    searchService,
  } = crowi;

  const { user } = req;

  const result = await getServerSideCommonProps(context);
  const props: Props = result.props as Props;
  if (user != null) {
    props.currentUser = JSON.stringify(user.toObject());
  }

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;

  return {
    props,
  };
};

export default AdminMarkdownSettingsPage;
