import React, { ReactNode } from 'react';
import { Provider } from 'unstated';
import dynamic from 'next/dynamic';

import { BasicLayout } from './BasicLayout';
// import { injectableContainers } from '~/client/admin';
// import AdminNavigation from '~/components/Admin/Common/AdminNavigation';

type Props = {
  title: string
  /**
   * Set the current option of AdminNavigation
   * Expected it is in ["home", "app", "security", "markdown", "customize", "importer", "export",
   * "notification", 'global-notification', "users", "user-groups", "search"]
   */
  selectedNavOpt: string
  children?: ReactNode
}

const AdminLayout = ({
  children, title, selectedNavOpt,
}: Props): JSX.Element => {

  const AdminNavigation = dynamic(() => import('~/components/Admin/Common/AdminNavigation'), { ssr: false });

  return (
    <BasicLayout title={title}>
      <header className="py-0">
        <h1 className="title">{title}</h1>
      </header>
      <div id="main" className="main">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3">
              <AdminNavigation selected={selectedNavOpt} />
            </div>
            <div className="col-lg-9">
              <Provider>
                {children}
              </Provider>
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default AdminLayout;
