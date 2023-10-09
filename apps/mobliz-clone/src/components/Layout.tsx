import React from 'react';

import Header from '~/components/Header';

import SideMenu from './SideMenu';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <main className="container d-flex mt-5">
        <div className="col-8">{children}</div>
        <div className="col-4 ms-5">
          <SideMenu />
        </div>
      </main>
    </>
  );
};

export default Layout;
