import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import dynamic from 'next/dynamic';

import BasicLayout from '../../components/BasicLayout';

import AdminHome from '~/client/js/components/Admin/AdminHome/AdminHome';

type Props = {
};

const AdminHomePage: NextPage<Props> = (props: Props) => {
  const AdminNavigation = dynamic(() => import('~/client/js/components/Admin/common/AdminNavigation'), { ssr: false });

  return (
    <>
      <BasicLayout title="GROWI">
        <header className="py-0">
          <h1 className="title"> Wiki Management Home Page</h1>
          {/* <h1 class="title"> {{ t('Wiki Management Home Page') }}</h1> */}
        </header>
        <div id="main" className="main">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-3">
                <AdminNavigation />
              </div>
              <div className="col-lg-9">
                {/* content */}
              </div>
            </div>
          </div>
        </div>
      </BasicLayout>
    </>
  );
};

export default AdminHomePage;
