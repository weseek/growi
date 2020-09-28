import dynamic from 'next/dynamic';
import React, { ReactNode } from 'react';

import GrowiNavbar from '~/client/js/components/Navbar/GrowiNavbar';
import GrowiNavbarBottom from '~/client/js/components/Navbar/GrowiNavbarBottom';

import RawLayout from './RawLayout';

type Props = {
  title: string
  children?: ReactNode
}

const BasicLayout = ({ children, title }: Props): JSX.Element => {

  const HotkeysManager = dynamic(() => import('../client/js/components/Hotkeys/HotkeysManager'), { ssr: false });
  const PageCreateModal = dynamic(() => import('../client/js/components/PageCreateModal'), { ssr: false });

  return (
    <>
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

      <PageCreateModal />
      <HotkeysManager />
    </>
  );
};

export default BasicLayout;
