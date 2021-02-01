import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';

import AdminLayout from '~/components/AdminLayout';

import { useTranslation } from '~/i18n';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, getServerSideCommonProps } from '~/utils/nextjs-page-utils';

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

const AdminSecuritySettingsPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();
  const title = t('Security settings');

  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);

  useSearchServiceConfigured(props.isSearchServiceConfigured);
  useSearchServiceReachable(props.isSearchServiceReachable);

  return (
    <AdminLayout title={title} selectedNavOpt="security" growiVersion={props.growiVersion}>
      security
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

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

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

export default AdminSecuritySettingsPage;
