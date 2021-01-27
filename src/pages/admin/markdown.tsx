import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';

import AdminLayout from '~/components/AdminLayout';

import { useTranslation } from '~/i18n';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, getServerSideCommonProps } from '~/utils/nextjs-page-utils';
import MarkDownSettingContents from '~/client/js/components/Admin/MarkdownSetting/MarkDownSettingContents';

import {
  useCurrentUser,
  useSearchServiceConfigured, useSearchServiceReachable,
} from '../../stores/context';

type Props = CommonProps & {
  currentUser: any,

  growiVersion: string,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
};

const AdminMarkdownSettingsPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();
  const title = t('Markdown Settings');

  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);

  useSearchServiceConfigured(props.isSearchServiceConfigured);
  useSearchServiceReachable(props.isSearchServiceReachable);

  return (
    <>
      <AdminLayout title={title} selectedNavOpt="markdown" growiVersion={props.growiVersion}>
        <MarkDownSettingContents />
      </AdminLayout>
    </>
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

  props.growiVersion = crowi.version;
  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;

  return {
    props,
  };
};

export default AdminMarkdownSettingsPage;
