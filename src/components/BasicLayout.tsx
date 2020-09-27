import React, { ReactNode } from 'react';

import GrowiNavbar from '~/client/js/components/Navbar/GrowiNavbar';
import GrowiNavbarBottom from '~/client/js/components/Navbar/GrowiNavbarBottom';

import RawLayout from './RawLayout';

type Props = {
  title: string
  children?: ReactNode
}

const BasicLayout = ({ children, title }: Props): JSX.Element => {

  return (
    <RawLayout title={title}>
      <GrowiNavbar />

      <div className="page-wrapper d-flex d-print-block">
        <div id="grw-sidebar-wrapper"></div>

        <div className="flex-fill mw-0">
          {children}
        </div>
      </div>

      <GrowiNavbarBottom />
    </RawLayout>
  );
};

export default BasicLayout;
