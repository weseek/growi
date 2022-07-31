import React, { ReactNode } from 'react';

import dynamic from 'next/dynamic';
import { Provider } from 'unstated';

import { GrowiNavbar } from '../Navbar/GrowiNavbar';

import { RawLayout } from './RawLayout';

import styles from './Admin.module.scss';


type Props = {
  title: string
  /**
   * Set the current option of AdminNavigation
   * Expected it is in ["home", "app", "security", "markdown", "customize", "importer", "export",
   * "notification", 'global-notification', "users", "user-groups", "search"]
   */
  selectedNavOpt: string
  children?: ReactNode
  injectableContainers: any
}


const AdminLayout = ({
  children, title, selectedNavOpt, injectableContainers,
}: Props): JSX.Element => {

  const AdminNavigation = dynamic(() => import('~/components/Admin/Common/AdminNavigation'), { ssr: false });
  const SystemVersion = dynamic(() => import('../SystemVersion'), { ssr: false });

  return (
    <RawLayout title={title} className={`admin-page ${styles['admin-page']}`}>
      <GrowiNavbar />

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
              <Provider inject={injectableContainers}>
                {children}
              </Provider>
            </div>
          </div>
        </div>
      </div>

      <SystemVersion />
    </RawLayout>
  );
};

export default AdminLayout;
