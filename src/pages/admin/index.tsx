import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import dynamic from 'next/dynamic';

import BasicLayout from '../../components/BasicLayout';

import { useTranslation } from '~/i18n';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { CommonProps, getServerSideCommonProps } from '~/utils/nextjs-page-utils';
import AdminHome from '~/client/js/components/Admin/AdminHome/AdminHome';

import {
  useCurrentUser,
  useAppTitle, useConfidential,
  useSearchServiceConfigured, useSearchServiceReachable,
} from '../../stores/context';

type Props = CommonProps & {
  currentUser: any,

  appTitle: string,
  confidential: string,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
};

const AdminHomePage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();
  const title = t('Wiki Management Home Page');
  const AdminNavigation = dynamic(() => import('~/client/js/components/Admin/common/AdminNavigation'), { ssr: false });

  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);

  useAppTitle(props.appTitle);
  useConfidential(props.confidential);
  useSearchServiceConfigured(props.isSearchServiceConfigured);
  useSearchServiceReachable(props.isSearchServiceReachable);

  return (
    <>
      <BasicLayout title="GROWI">
        <header className="py-0">
          <h1 className="title">{title}</h1>
        </header>
        <div id="main" className="main">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-3">
                <AdminNavigation />
              </div>
              <div className="col-lg-9">
                <AdminHome />
              </div>
            </div>
          </div>
        </div>
      </BasicLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, searchService,
  } = crowi;

  const { user } = req;

  const result = await getServerSideCommonProps(context);
  const props: Props = result.props as Props;
  if (user != null) {
    props.currentUser = JSON.stringify(user.toObject());
  }

  props.confidential = appService.getAppConfidential();
  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;

  return {
    props,
  };
};

export default AdminHomePage;
