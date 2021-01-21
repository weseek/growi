import dynamic from 'next/dynamic';
import React, { ReactNode } from 'react';

import BasicLayout from './BasicLayout';

type Props = {
  title: string
  children?: ReactNode
}

const AdminLayout = ({ children, title }: Props): JSX.Element => {
  const AdminNavigation = dynamic(() => import('~/client/js/components/Admin/Common/AdminNavigation'), { ssr: false });

  return (
    <BasicLayout title={title}>
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
              {children}
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default AdminLayout;
